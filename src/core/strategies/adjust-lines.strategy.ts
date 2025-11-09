import { ProcessResult } from '../interfaces/file-processor.interface';
import { BaseFileProcessingStrategy } from './file-processing.strategy';

/**
 * Strategy para ajustar linhas vazias em arquivos
 * 
 * Comportamento:
 * - Mantém APENAS 1 linha vazia entre blocos de código
 * - Remove linhas vazias duplicadas consecutivas
 * - Remove linha vazia no final do arquivo
 * - Preserva a primeira linha vazia de cada sequência
 * 
 * Exemplo:
 * ANTES:
 * ```
 * function hello() {
 * 
 * 
 *     console.log('Hello');
 * 
 * 
 * 
 * }
 * ```
 * 
 * DEPOIS:
 * ```
 * function hello() {
 * 
 *     console.log('Hello');
 * 
 * }
 * ```
 */
export class AdjustLinesStrategy extends BaseFileProcessingStrategy {
    
    getName(): string {
        return 'Adjust Empty Lines';
    }

    /**
     * Processa o arquivo mantendo apenas 1 linha vazia entre blocos
     * @param content Conteúdo original do arquivo
     * @returns Resultado com conteúdo processado
     */
    processFile(content: string): ProcessResult {
        // Validar entrada
        this.validateContent(content);

        // Se conteúdo vazio, retornar como está
        if (content.length === 0) {
            return {
                content: '',
                linesChanged: 0
            };
        }

        // Dividir em linhas
        const lines = this.splitLines(content);
        const processedLines: string[] = [];
        let previousLineWasEmpty = false;

        // Processar cada linha
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isCurrentLineEmpty = this.isEmptyLine(line);

            // Se a linha atual é vazia E a anterior também era vazia
            if (isCurrentLineEmpty && previousLineWasEmpty) {
                // Pular esta linha (é uma duplicata)
                continue;
            }

            // Adicionar linha ao resultado
            processedLines.push(line);
            
            // Atualizar flag
            previousLineWasEmpty = isCurrentLineEmpty;
        }

        // Remover linha vazia final se existir
        const finalLines = this.removeTrailingEmptyLine(processedLines);

        // Juntar linhas
        const processedContent = this.joinLines(finalLines);

        // Criar resultado com metadados
        return this.createResult(content, processedContent);
    }

    /**
     * Analisa o arquivo e retorna informações sobre as linhas vazias
     * Útil para preview antes de processar
     * @param content Conteúdo do arquivo
     */
    public analyzeEmptyLines(content: string): {
        totalLines: number;
        emptyLines: number;
        consecutiveEmptyLineGroups: number;
        linesToBeRemoved: number;
    } {
        const lines = this.splitLines(content);
        let emptyLineCount = 0;
        let consecutiveGroups = 0;
        let linesToRemove = 0;
        let inEmptyGroup = false;
        let groupSize = 0;

        for (const line of lines) {
            const isEmpty = this.isEmptyLine(line);

            if (isEmpty) {
                emptyLineCount++;
                groupSize++;

                if (!inEmptyGroup) {
                    inEmptyGroup = true;
                    consecutiveGroups++;
                }
            } else {
                // Fim de um grupo de linhas vazias
                if (inEmptyGroup && groupSize > 1) {
                    // Todas menos a primeira serão removidas
                    linesToRemove += (groupSize - 1);
                }
                inEmptyGroup = false;
                groupSize = 0;
            }
        }

        // Verificar último grupo
        if (inEmptyGroup && groupSize > 1) {
            linesToRemove += (groupSize - 1);
        }

        // Adicionar linha vazia final se existir
        if (lines.length > 0 && this.isEmptyLine(lines[lines.length - 1])) {
            linesToRemove++;
        }

        return {
            totalLines: lines.length,
            emptyLines: emptyLineCount,
            consecutiveEmptyLineGroups: consecutiveGroups,
            linesToBeRemoved: linesToRemove
        };
    }

    /**
     * Verifica se o arquivo precisa de ajuste
     * @param content Conteúdo do arquivo
     * @returns true se houver linhas vazias duplicadas
     */
    public needsAdjustment(content: string): boolean {
        const analysis = this.analyzeEmptyLines(content);
        return analysis.linesToBeRemoved > 0;
    }
}