import { IFileProcessingStrategy, ProcessResult } from '../interfaces/file-processor.interface';

/**
 * Strategy para converter aspas em arquivos
 * Implementa IFileProcessingStrategy
 * 
 * Responsabilidade: Converter entre aspas simples e duplas
 * - Simples → Dupla: 'texto' → "texto"
 * - Dupla → Simples: "texto" → 'texto'
 * 
 * Respeita:
 * - Template literals (`texto`)
 * - Aspas escapadas (\\' e \\")
 * - Strings dentro de strings
 */
export class QuoteConverterStrategy implements IFileProcessingStrategy {
    private mode: 'single-to-double' | 'double-to-single';

    constructor(mode: 'single-to-double' | 'double-to-single' = 'single-to-double') {
        this.mode = mode;
    }

    /**
     * Retorna o nome da strategy
     */
    getName(): string {
        return 'Quote Converter Strategy';
    }

    /**
     * Processa o conteúdo do arquivo convertendo aspas
     */
    processFile(content: string): ProcessResult {
        const originalLines = content.split('\n');
        const totalLines = originalLines.length;

        let processedContent: string;
        let linesChanged: number;

        if (this.mode === 'single-to-double') {
            processedContent = this.convertSingleToDouble(content);
        } else {
            processedContent = this.convertDoubleToSingle(content);
        }

        // Contar linhas que mudaram
        const processedLines = processedContent.split('\n');
        linesChanged = originalLines.filter((line, index) => 
            line !== processedLines[index]
        ).length;

        return {
            content: processedContent,
            linesChanged
        };
    }

    /**
     * Converte aspas simples para duplas
     * 'texto' → "texto"
     */
    private convertSingleToDouble(content: string): string {
        let result = '';
        let i = 0;
        
        while (i < content.length) {
            const char = content[i];
            
            // Ignorar template literals
            if (char === '`') {
                result += char;
                i++;
                while (i < content.length && content[i] !== '`') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i] + content[i + 1];
                        i += 2;
                    } else {
                        result += content[i];
                        i++;
                    }
                }
                if (i < content.length) {
                    result += content[i];
                    i++;
                }
                continue;
            }

            // Ignorar aspas duplas
            if (char === '"') {
                result += char;
                i++;
                while (i < content.length && content[i] !== '"') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i] + content[i + 1];
                        i += 2;
                    } else {
                        result += content[i];
                        i++;
                    }
                }
                if (i < content.length) {
                    result += content[i];
                    i++;
                }
                continue;
            }

            // Converter aspas simples para duplas
            if (char === "'") {
                if (i > 0 && content[i - 1] === '\\') {
                    result += char;
                    i++;
                    continue;
                }

                result += '"';
                i++;

                while (i < content.length && content[i] !== "'") {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        if (content[i + 1] === "'") {
                            result += content[i + 1];
                            i += 2;
                        } else if (content[i + 1] === '"') {
                            result += '\\' + content[i + 1];
                            i += 2;
                        } else {
                            result += content[i] + content[i + 1];
                            i += 2;
                        }
                    } else if (content[i] === '"') {
                        result += '\\"';
                        i++;
                    } else {
                        result += content[i];
                        i++;
                    }
                }

                if (i < content.length) {
                    result += '"';
                    i++;
                }
                continue;
            }

            result += char;
            i++;
        }

        return result;
    }

    /**
     * Converte aspas duplas para simples
     * "texto" → 'texto'
     */
    private convertDoubleToSingle(content: string): string {
        let result = '';
        let i = 0;
        
        while (i < content.length) {
            const char = content[i];
            
            // Ignorar template literals
            if (char === '`') {
                result += char;
                i++;
                while (i < content.length && content[i] !== '`') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i] + content[i + 1];
                        i += 2;
                    } else {
                        result += content[i];
                        i++;
                    }
                }
                if (i < content.length) {
                    result += content[i];
                    i++;
                }
                continue;
            }

            // Ignorar aspas simples
            if (char === "'") {
                result += char;
                i++;
                while (i < content.length && content[i] !== "'") {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i] + content[i + 1];
                        i += 2;
                    } else {
                        result += content[i];
                        i++;
                    }
                }
                if (i < content.length) {
                    result += content[i];
                    i++;
                }
                continue;
            }

            // Converter aspas duplas para simples
            if (char === '"') {
                if (i > 0 && content[i - 1] === '\\') {
                    result += char;
                    i++;
                    continue;
                }

                result += "'";
                i++;

                while (i < content.length && content[i] !== '"') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        if (content[i + 1] === '"') {
                            result += content[i + 1];
                            i += 2;
                        } else if (content[i + 1] === "'") {
                            result += '\\' + content[i + 1];
                            i += 2;
                        } else {
                            result += content[i] + content[i + 1];
                            i += 2;
                        }
                    } else if (content[i] === "'") {
                        result += "\\'";
                        i++;
                    } else {
                        result += content[i];
                        i++;
                    }
                }

                if (i < content.length) {
                    result += "'";
                    i++;
                }
                continue;
            }

            result += char;
            i++;
        }

        return result;
    }
}