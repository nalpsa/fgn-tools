"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpStrategy = exports.BaseFileProcessingStrategy = void 0;
/**
 * Classe base abstrata para estratégias de processamento de arquivos
 * Implementa o Strategy Pattern
 *
 * Esta classe fornece funcionalidades comuns para todas as estratégias,
 * permitindo que subclasses implementem apenas a lógica específica.
 */
class BaseFileProcessingStrategy {
    /**
     * Divide o conteúdo em linhas preservando informações de line ending
     * @param content Conteúdo do arquivo
     * @returns Array de linhas
     */
    splitLines(content) {
        return content.split('\n');
    }
    /**
     * Junta linhas novamente em string
     * @param lines Array de linhas
     * @returns Conteúdo unificado
     */
    joinLines(lines) {
        return lines.join('\n');
    }
    /**
     * Verifica se uma linha está vazia (apenas espaços em branco)
     * @param line Linha a verificar
     */
    isEmptyLine(line) {
        return line.trim() === '';
    }
    /**
     * Remove linha vazia final se existir
     * @param lines Array de linhas
     * @returns Array sem linha vazia final
     */
    removeTrailingEmptyLine(lines) {
        const result = [...lines];
        while (result.length > 0 && this.isEmptyLine(result[result.length - 1])) {
            result.pop();
        }
        return result;
    }
    /**
     * Cria um ProcessResult com metadados calculados
     * @param originalContent Conteúdo original
     * @param processedContent Conteúdo processado
     * @returns ProcessResult completo
     */
    createResult(originalContent, processedContent) {
        const originalLines = this.splitLines(originalContent);
        const processedLines = this.splitLines(processedContent);
        const linesChanged = originalLines.length - processedLines.length;
        const charactersRemoved = originalContent.length - processedContent.length;
        return {
            content: processedContent,
            linesChanged: Math.abs(linesChanged),
            metadata: {
                originalLines: originalLines.length,
                finalLines: processedLines.length,
                charactersRemoved: charactersRemoved > 0 ? charactersRemoved : 0,
                charactersAdded: charactersRemoved < 0 ? Math.abs(charactersRemoved) : 0
            }
        };
    }
    /**
     * Valida se o conteúdo não é nulo ou undefined
     * @param content Conteúdo a validar
     */
    validateContent(content) {
        if (content === null || content === undefined) {
            throw new Error('Content cannot be null or undefined');
        }
    }
    /**
     * Conta linhas vazias em um array
     * @param lines Array de linhas
     */
    countEmptyLines(lines) {
        return lines.filter(line => this.isEmptyLine(line)).length;
    }
    /**
     * Obtém estatísticas do conteúdo
     * @param content Conteúdo para analisar
     */
    getContentStats(content) {
        const lines = this.splitLines(content);
        const emptyLines = this.countEmptyLines(lines);
        return {
            totalLines: lines.length,
            emptyLines,
            nonEmptyLines: lines.length - emptyLines,
            totalCharacters: content.length
        };
    }
}
exports.BaseFileProcessingStrategy = BaseFileProcessingStrategy;
/**
 * Strategy que não faz nenhuma modificação (útil para testes e debug)
 */
class NoOpStrategy extends BaseFileProcessingStrategy {
    getName() {
        return 'No Operation';
    }
    processFile(content) {
        this.validateContent(content);
        return {
            content,
            linesChanged: 0,
            metadata: {
                originalLines: this.splitLines(content).length,
                finalLines: this.splitLines(content).length,
                charactersRemoved: 0,
                charactersAdded: 0
            }
        };
    }
}
exports.NoOpStrategy = NoOpStrategy;
//# sourceMappingURL=file-processing.strategy.js.map