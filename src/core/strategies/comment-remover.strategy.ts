import { IFileProcessingStrategy, ProcessResult } from '../interfaces/file-processor.interface';

/**
 * Strategy para remover comentários de código
 * Implementa IFileProcessingStrategy
 * 
 * Responsabilidade: Remover comentários mantendo a estrutura
 * - Remove // comentários de linha
 * - Remove /* comentários de bloco * /
 * - Remove '<!-- comentários HTML -->
 * - Remove # comentários Python/Shell
 * - Preserva strings que contenham símbolos de comentário
 * - Preserva URLs (http://, https://)
 */
export class CommentRemoverStrategy implements IFileProcessingStrategy {
    private fileExtension: string;

    constructor(fileExtension: string = '') {
        this.fileExtension = fileExtension.toLowerCase();
    }

    /**
     * Retorna o nome da strategy
     */
    getName(): string {
        return 'Comment Remover Strategy';
    }

    /**
     * Processa o conteúdo removendo comentários
     */
    processFile(content: string): ProcessResult {
        const originalLines = content.split('\n');
        const totalLines = originalLines.length;

        let processedContent: string;

        // Escolher método baseado na extensão do arquivo
        if (this.isJavaScriptLike()) {
            processedContent = this.removeJavaScriptComments(content);
        } else if (this.isHTMLLike()) {
            processedContent = this.removeHTMLComments(content);
        } else if (this.isPythonLike()) {
            processedContent = this.removePythonComments(content);
        } else if (this.isCSSLike()) {
            processedContent = this.removeCSSComments(content);
        } else {
            processedContent = this.removeJavaScriptComments(content);
        }

        // Contar linhas que mudaram
        const processedLines = processedContent.split('\n');
        const linesChanged = originalLines.filter((line, index) => 
            line !== processedLines[index]
        ).length;

        return {
            content: processedContent,
            linesChanged
        };
    }

    /**
     * Remove comentários de linguagens tipo JavaScript
     */
    private removeJavaScriptComments(content: string): string {
        let result = '';
        let i = 0;

        while (i < content.length) {
            // Ignorar strings entre aspas duplas
            if (content[i] === '"') {
                result += content[i++];
                while (i < content.length && content[i] !== '"') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i++] + content[i++];
                    } else {
                        result += content[i++];
                    }
                }
                if (i < content.length) result += content[i++];
                continue;
            }

            // Ignorar strings entre aspas simples
            if (content[i] === "'") {
                result += content[i++];
                while (i < content.length && content[i] !== "'") {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i++] + content[i++];
                    } else {
                        result += content[i++];
                    }
                }
                if (i < content.length) result += content[i++];
                continue;
            }

            // Ignorar template literals
            if (content[i] === '`') {
                result += content[i++];
                while (i < content.length && content[i] !== '`') {
                    if (content[i] === '\\' && i + 1 < content.length) {
                        result += content[i++] + content[i++];
                    } else {
                        result += content[i++];
                    }
                }
                if (i < content.length) result += content[i++];
                continue;
            }

            // Comentário de linha //
            if (content[i] === '/' && i + 1 < content.length && content[i + 1] === '/') {
                // Verificar se não é URL
                if (i >= 5 && content.substring(i - 5, i) === 'http:') {
                    result += content[i++];
                    continue;
                }
                if (i >= 6 && content.substring(i - 6, i) === 'https:') {
                    result += content[i++];
                    continue;
                }

                // Pular até o fim da linha
                while (i < content.length && content[i] !== '\n') {
                    i++;
                }
                if (i < content.length) {
                    result += content[i++];
                }
                continue;
            }

            // Comentário de bloco /* */
            if (content[i] === '/' && i + 1 < content.length && content[i + 1] === '*') {
                i += 2;
                while (i < content.length - 1) {
                    if (content[i] === '*' && content[i + 1] === '/') {
                        i += 2;
                        break;
                    }
                    i++;
                }
                continue;
            }

            result += content[i++];
        }

        return result;
    }

    /**
     * Remove comentários HTML
     */
    private removeHTMLComments(content: string): string {
        let result = '';
        let i = 0;

        while (i < content.length) {
            if (i + 3 < content.length && 
                content[i] === '<' && 
                content[i + 1] === '!' && 
                content[i + 2] === '-' && 
                content[i + 3] === '-') {
                
                i += 4;
                while (i < content.length - 2) {
                    if (content[i] === '-' && content[i + 1] === '-' && content[i + 2] === '>') {
                        i += 3;
                        break;
                    }
                    i++;
                }
                continue;
            }

            result += content[i++];
        }

        return result;
    }

    /**
     * Remove comentários Python/Shell (#)
     */
    private removePythonComments(content: string): string {
        const lines = content.split('\n');
        const result: string[] = [];

        for (const line of lines) {
            let cleaned = '';
            let inString = false;
            let stringChar = '';
            let i = 0;

            while (i < line.length) {
                const char = line[i];

                if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== '\\')) {
                    if (!inString) {
                        inString = true;
                        stringChar = char;
                    } else if (char === stringChar) {
                        inString = false;
                    }
                    cleaned += char;
                    i++;
                    continue;
                }

                if (char === '#' && !inString) {
                    break;
                }

                cleaned += char;
                i++;
            }

            result.push(cleaned);
        }

        return result.join('\n');
    }

    /**
     * Remove comentários CSS
     */
    private removeCSSComments(content: string): string {
        let result = '';
        let i = 0;

        while (i < content.length) {
            if (content[i] === '/' && i + 1 < content.length && content[i + 1] === '*') {
                i += 2;
                while (i < content.length - 1) {
                    if (content[i] === '*' && content[i + 1] === '/') {
                        i += 2;
                        break;
                    }
                    i++;
                }
                continue;
            }

            result += content[i++];
        }

        return result;
    }

    private isJavaScriptLike(): boolean {
        return ['.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h', 
                '.go', '.rs', '.swift', '.kt', '.cs', '.php'].includes(this.fileExtension);
    }

    private isHTMLLike(): boolean {
        return ['.html', '.htm', '.xml', '.svg', '.vue'].includes(this.fileExtension);
    }

    private isPythonLike(): boolean {
        return ['.py', '.sh', '.bash', '.rb', '.pl', '.yaml', '.yml'].includes(this.fileExtension);
    }

    private isCSSLike(): boolean {
        return ['.css', '.scss', '.sass', '.less'].includes(this.fileExtension);
    }
}