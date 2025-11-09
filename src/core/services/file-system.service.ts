import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Serviço para operações de sistema de arquivos
 * Encapsula fs/promises para facilitar testes e manutenção
 */
export class FileSystemService {
    private static instance: FileSystemService;

    private constructor() {}

    public static getInstance(): FileSystemService {
        if (!FileSystemService.instance) {
            FileSystemService.instance = new FileSystemService();
        }
        return FileSystemService.instance;
    }

    /**
     * Lê o conteúdo de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Conteúdo do arquivo como string
     */
    public async readFile(filePath: string): Promise<string> {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            throw new Error(`Erro ao ler arquivo ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * Escreve conteúdo em um arquivo
     * @param filePath Caminho do arquivo
     * @param content Conteúdo a ser escrito
     */
    public async writeFile(filePath: string, content: string): Promise<void> {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error) {
            throw new Error(`Erro ao escrever arquivo ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * Verifica se um arquivo ou diretório existe
     * @param filePath Caminho do arquivo/diretório
     * @returns true se existe, false caso contrário
     */
    public async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Verifica se um caminho é um diretório
     * @param dirPath Caminho a verificar
     * @returns true se é diretório, false caso contrário
     */
    public async isDirectory(dirPath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Verifica se um caminho é um arquivo
     * @param filePath Caminho a verificar
     * @returns true se é arquivo, false caso contrário
     */
    public async isFile(filePath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(filePath);
            return stats.isFile();
        } catch {
            return false;
        }
    }

    /**
     * Lista o conteúdo de um diretório
     * @param dirPath Caminho do diretório
     * @returns Array com nomes dos arquivos/pastas
     */
    public async readDirectory(dirPath: string): Promise<string[]> {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            return entries.map(entry => entry.name);
        } catch (error) {
            throw new Error(`Erro ao ler diretório ${dirPath}: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * Processa uma pasta recursivamente aplicando um callback em cada arquivo
     * @param dirPath Caminho da pasta
     * @param callback Função a ser executada para cada arquivo
     * @param options Opções de processamento
     * @returns Estatísticas do processamento
     */
    public async processFolder(
        dirPath: string,
        callback: (filePath: string) => Promise<void>,
        options: {
            excludePatterns?: string[];
            includeExtensions?: string[];
        } = {}
    ): Promise<{ processedFiles: number; errors: number }> {
        const stats = { processedFiles: 0, errors: 0 };
        const { excludePatterns = [], includeExtensions = [] } = options;

        try {
            const entries = await this.readDirectory(dirPath);

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry);

                // Verificar se deve ser excluído
                if (this.shouldExclude(entry, excludePatterns)) {
                    continue;
                }

                if (await this.isDirectory(fullPath)) {
                    // Recursão em subpastas
                    const subStats = await this.processFolder(fullPath, callback, options);
                    stats.processedFiles += subStats.processedFiles;
                    stats.errors += subStats.errors;
                } else if (await this.isFile(fullPath)) {
                    // Processar arquivo se passar no filtro de extensões
                    if (includeExtensions.length === 0 || this.hasValidExtension(fullPath, includeExtensions)) {
                        try {
                            await callback(fullPath);
                            stats.processedFiles++;
                        } catch (error) {
                            console.error(`Erro ao processar ${fullPath}:`, error);
                            stats.errors++;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Erro ao processar pasta ${dirPath}:`, error);
            stats.errors++;
        }

        return stats;
    }

    /**
     * Verifica se um arquivo é de texto baseado na extensão
     * @param filePath Caminho do arquivo
     * @param validExtensions Lista de extensões válidas (opcional)
     * @returns true se é arquivo de texto
     */
    public isTextFile(filePath: string, validExtensions?: string[]): boolean {
        const defaultExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
            '.md', '.txt', '.xml', '.yaml', '.yml', '.py', '.java', '.c', '.cpp',
            '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart',
            '.vue', '.svelte', '.sql', '.sh', '.bash', '.ps1', '.bat', '.cmd'
        ];

        const extensions = validExtensions || defaultExtensions;
        const ext = this.getFileExtension(filePath);
        return extensions.includes(ext);
    }

    /**
     * Obtém a extensão de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Extensão com ponto (ex: '.ts')
     */
    public getFileExtension(filePath: string): string {
        return path.extname(filePath).toLowerCase();
    }

    /**
     * Obtém informações sobre um arquivo
     * @param filePath Caminho do arquivo
     * @returns Stats do arquivo
     */
    public async getFileStats(filePath: string): Promise<{
        size: number;
        created: Date;
        modified: Date;
        isDirectory: boolean;
        isFile: boolean;
    }> {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile()
            };
        } catch (error) {
            throw new Error(`Erro ao obter informações de ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * Cria um backup de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Caminho do backup criado
     */
    public async createBackup(filePath: string): Promise<string> {
        const backupPath = `${filePath}.backup`;
        try {
            const content = await this.readFile(filePath);
            await this.writeFile(backupPath, content);
            return backupPath;
        } catch (error) {
            throw new Error(`Erro ao criar backup de ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }

    /**
     * Verifica se um arquivo/pasta deve ser excluído baseado em padrões
     * @param name Nome do arquivo/pasta
     * @param patterns Padrões de exclusão
     * @returns true se deve ser excluído
     */
    private shouldExclude(name: string, patterns: string[]): boolean {
        return patterns.some(pattern => {
            if (pattern.includes('*')) {
                // Padrão com wildcard (simplificado)
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name);
            }
            return name === pattern || name.startsWith(pattern);
        });
    }

    /**
     * Verifica se um arquivo tem uma extensão válida
     * @param filePath Caminho do arquivo
     * @param validExtensions Lista de extensões válidas
     * @returns true se tem extensão válida
     */
    private hasValidExtension(filePath: string, validExtensions: string[]): boolean {
        const ext = this.getFileExtension(filePath);
        return validExtensions.includes(ext);
    }

    /**
     * Extrai mensagem de erro de um objeto Error
     * @param error Erro capturado
     * @returns Mensagem de erro formatada
     */
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}