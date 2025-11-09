import { ProcessResult } from '../interfaces/file-processor.interface';
import { BaseFileProcessingStrategy } from './file-processing.strategy';

/**
 * Strategy para remover TODAS as linhas vazias de arquivos
 * 
 * Comportamento:
 * - Remove TODAS as linhas que contêm apenas espaços em branco
 * - Não mantém nenhuma linha vazia
 * - Código fica ultra-compacto
 * 
 * Exemplo:
 * ANTES:
 * ```
 * function hello() {
 * 
 *     console.log('Hello');
 * 
 *     return true;
 * 
 * }
 * ```
 * 
 * DEPOIS:
 * ```
 * function hello() {
 *     console.log('Hello');
 *     return true;
 * }
 * ```
 */
export class RemoveEmptyLinesStrategy extends BaseFileProcessingStrategy {
    
    getName(): string {
        return 'Remove All Empty Lines';
    }

    /**
     * Processa o arquivo removendo TODAS as linhas vazias
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
        
        // Filtrar apenas linhas não vazias
        const nonEmptyLines = lines.filter(line => !this.isEmptyLine(line));

        // Juntar linhas
        const processedContent = this.joinLines(nonEmptyLines);

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
        nonEmptyLines: number;
        percentageEmpty: number;
    } {
        const stats = this.getContentStats(content);

        return {
            totalLines: stats.totalLines,
            emptyLines: stats.emptyLines,
            nonEmptyLines: stats.nonEmptyLines,
            percentageEmpty: stats.totalLines > 0 
                ? (stats.emptyLines / stats.totalLines) * 100 
                : 0
        };
    }

    /**
     * Verifica se o arquivo tem linhas vazias para remover
     * @param content Conteúdo do arquivo
     * @returns true se houver pelo menos uma linha vazia
     */
    public hasEmptyLines(content: string): boolean {
        const lines = this.splitLines(content);
        return lines.some(line => this.isEmptyLine(line));
    }

    /**
     * Conta quantas linhas serão removidas
     * @param content Conteúdo do arquivo
     * @returns Número de linhas vazias que serão removidas
     */
    public countLinesToRemove(content: string): number {
        return this.countEmptyLines(this.splitLines(content));
    }

    /**
     * Preview do processamento sem modificar o arquivo
     * Útil para mostrar ao usuário o que será feito
     * @param content Conteúdo original
     * @returns Preview com primeiras linhas do resultado
     */
    public previewProcessing(content: string, maxLines: number = 10): {
        beforeLines: string[];
        afterLines: string[];
        totalLinesRemoved: number;
    } {
        const originalLines = this.splitLines(content);
        const result = this.processFile(content);
        const processedLines = this.splitLines(result.content);

        return {
            beforeLines: originalLines.slice(0, maxLines),
            afterLines: processedLines.slice(0, maxLines),
            totalLinesRemoved: result.linesChanged
        };
    }
}