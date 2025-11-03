import { ITool, ToolCategory, ToolResult, FileSelectionInput } from '../../core/interfaces/tool.interface';
import * as fs from 'fs';
import * as path from 'path';

export class AdjustEmptyLinesTool implements ITool {
    id = 'adjust-empty-lines';
    name = 'Ajustar Linhas Vazias';
    description = 'Remove linhas vazias excedentes (mantém 1 entre blocos)';
    icon = '🪄';
    category = ToolCategory.CODE;

    async execute(input: FileSelectionInput): Promise<ToolResult> {
        try {
            let totalArquivos = 0;
            let totalLinhasRemovidas = 0;

            for (const selection of input.selections) {
                if (selection.selected) {
                    const fullPath = path.join(input.workspacePath, selection.path);
                    
                    if (selection.type === 'folder') {
                        const resultado = await this.processarPasta(fullPath);
                        totalArquivos += resultado.arquivos;
                        totalLinhasRemovidas += resultado.linhas;
                    } else {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            totalArquivos++;
                            totalLinhasRemovidas += resultado.linhasRemovidas;
                        }
                    }
                }
            }

            return {
                success: true,
                stats: {
                    filesProcessed: totalArquivos,
                    linesChanged: totalLinhasRemovidas
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Erro ao processar: ${error}`
            };
        }
    }

    private async processarPasta(pastaPath: string): Promise<{arquivos: number, linhas: number}> {
        let arquivos = 0;
        let linhas = 0;

        const processarRecursivo = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        await processarRecursivo(fullPath);
                    } else if (this.isArquivoTexto(entry.name)) {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            arquivos++;
                            linhas += resultado.linhasRemovidas;
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao processar pasta:', error);
            }
        };

        await processarRecursivo(pastaPath);
        return { arquivos, linhas };
    }

    private async processarArquivo(filePath: string): Promise<{linhasRemovidas: number} | null> {
        try {
            const conteudo = await fs.promises.readFile(filePath, 'utf-8');
            const linhas = conteudo.split('\n');
            const novasLinhas: string[] = [];
            let linhasRemovidas = 0;

            let i = 0;
            while (i < linhas.length) {
                const linhaAtual = linhas[i];
                const linhaVazia = linhaAtual.trim() === '';

                if (!linhaVazia) {
                    novasLinhas.push(linhaAtual);
                    i++;
                    continue;
                }

                let countVazias = 0;
                let j = i;
                while (j < linhas.length && linhas[j].trim() === '') {
                    countVazias++;
                    j++;
                }

                if (countVazias >= 1) {
                    novasLinhas.push('');
                    linhasRemovidas += (countVazias - 1);
                }

                i = j;
            }

            while (novasLinhas.length > 0 && novasLinhas[novasLinhas.length - 1].trim() === '') {
                novasLinhas.pop();
                linhasRemovidas++;
            }

            const novoConteudo = novasLinhas.join('\n');
            
            if (linhasRemovidas > 0) {
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
            }

            return { linhasRemovidas };
        } catch (error) {
            console.error(`❌ Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }

    private isArquivoTexto(nome: string): boolean {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        return extensoes.some(ext => nome.toLowerCase().endsWith(ext));
    }
}