import { IFileProcessingStrategy, ProcessResult } from '../interfaces/file-processor.interface';

/**
 * Classe base abstrata para estratégias de processamento de arquivos
 * Implementa o Strategy Pattern
 * 
 * Esta classe fornece funcionalidades comuns para todas as estratégias,
 * permitindo que subclasses implementem apenas a lógica específica.
 */
export abstract class BaseFileProcessingStrategy implements IFileProcessingStrategy {
    /**
     * Processa o conteúdo de um arquivo (implementado por subclasses)
     * @param content Conteúdo original do arquivo
     * @returns Resultado do processamento
     */
    abstract processFile(content: string): ProcessResult;

    /**
     * Retorna o nome descritivo da estratégia
     */
    abstract getName(): string;

    /**
     * Divide o conteúdo em linhas preservando informações de line ending
     * @param content Conteúdo do arquivo
     * @returns Array de linhas
     */
    protected splitLines(content: string): string[] {
        return content.split('\n');
    }

    /**
     * Junta linhas novamente em string
     * @param lines Array de linhas
     * @returns Conteúdo unificado
     */
    protected joinLines(lines: string[]): string {
        return lines.join('\n');
    }

    /**
     * Verifica se uma linha está vazia (apenas espaços em branco)
     * @param line Linha a verificar
     */
    protected isEmptyLine(line: string): boolean {
        return line.trim() === '';
    }

    /**
     * Remove linha vazia final se existir
     * @param lines Array de linhas
     * @returns Array sem linha vazia final
     */
    protected removeTrailingEmptyLine(lines: string[]): string[] {
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
    protected createResult(originalContent: string, processedContent: string): ProcessResult {
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
    protected validateContent(content: string): void {
        if (content === null || content === undefined) {
            throw new Error('Content cannot be null or undefined');
        }
    }

    /**
     * Conta linhas vazias em um array
     * @param lines Array de linhas
     */
    protected countEmptyLines(lines: string[]): number {
        return lines.filter(line => this.isEmptyLine(line)).length;
    }

    /**
     * Obtém estatísticas do conteúdo
     * @param content Conteúdo para analisar
     */
    protected getContentStats(content: string): {
        totalLines: number;
        emptyLines: number;
        nonEmptyLines: number;
        totalCharacters: number;
    } {
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

/**
 * Strategy que não faz nenhuma modificação (útil para testes e debug)
 */
export class NoOpStrategy extends BaseFileProcessingStrategy {
    getName(): string {
        return 'No Operation';
    }

    processFile(content: string): ProcessResult {
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