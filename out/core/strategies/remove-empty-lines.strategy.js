"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveEmptyLinesStrategy = void 0;
const file_processing_strategy_1 = require("./file-processing.strategy");
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
class RemoveEmptyLinesStrategy extends file_processing_strategy_1.BaseFileProcessingStrategy {
    getName() {
        return 'Remove All Empty Lines';
    }
    /**
     * Processa o arquivo removendo TODAS as linhas vazias
     * @param content Conteúdo original do arquivo
     * @returns Resultado com conteúdo processado
     */
    processFile(content) {
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
    analyzeEmptyLines(content) {
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
    hasEmptyLines(content) {
        const lines = this.splitLines(content);
        return lines.some(line => this.isEmptyLine(line));
    }
    /**
     * Conta quantas linhas serão removidas
     * @param content Conteúdo do arquivo
     * @returns Número de linhas vazias que serão removidas
     */
    countLinesToRemove(content) {
        return this.countEmptyLines(this.splitLines(content));
    }
    /**
     * Preview do processamento sem modificar o arquivo
     * Útil para mostrar ao usuário o que será feito
     * @param content Conteúdo original
     * @returns Preview com primeiras linhas do resultado
     */
    previewProcessing(content, maxLines = 10) {
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
exports.RemoveEmptyLinesStrategy = RemoveEmptyLinesStrategy;
//# sourceMappingURL=remove-empty-lines.strategy.js.map