import { IFileProcessingStrategy, ProcessResult } from '../interfaces/file-processor.interface';

/**
 * Tipos de TODOs detectados
 */
export type TodoType = 'TODO' | 'FIXME' | 'NOTE' | 'HACK' | 'XXX';

/**
 * Representa um item TODO encontrado
 */
export interface TodoItem {
    type: TodoType;
    text: string;
    line: number;
    author?: string;
}

/**
 * Resultado estendido com TODOs detectados
 */
export interface TodoDetectionResult extends ProcessResult {
    todos?: TodoItem[];
}

/**
 * Strategy para detecção de TODOs, FIXMEs e NOTEs
 * Implementa IFileProcessingStrategy
 * 
 * Responsabilidade: Detectar e catalogar pendências
 * - TODO: Tarefas planejadas
 * - FIXME: Correções necessárias
 * - NOTE: Observações importantes
 * - HACK: Soluções temporárias
 * - XXX: Atenção especial
 */
export class TodoDetectorStrategy implements IFileProcessingStrategy {
    private patterns: RegExp[];

    constructor() {
        // Padrões para detectar diferentes tipos de TODOs
        this.patterns = [
            /\/\/\s*TODO:?\s*(.+)/gi,
            /\/\/\s*FIXME:?\s*(.+)/gi,
            /\/\/\s*NOTE:?\s*(.+)/gi,
            /\/\/\s*HACK:?\s*(.+)/gi,
            /\/\/\s*XXX:?\s*(.+)/gi,
            /\/\*\s*TODO:?\s*(.+?)\*\//gi,
            /\/\*\s*FIXME:?\s*(.+?)\*\//gi,
            /\/\*\s*NOTE:?\s*(.+?)\*\//gi,
            /#\s*TODO:?\s*(.+)/gi,
            /#\s*FIXME:?\s*(.+)/gi,
        ];
    }

    /**
     * Retorna o nome da strategy
     */
    getName(): string {
        return 'Todo Detector Strategy';
    }

    /**
     * Processa o conteúdo detectando TODOs
     */
    processFile(content: string): TodoDetectionResult {
        const lines = content.split('\n');
        const todos: TodoItem[] = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            
            // Detectar TODO
            if (/\/\/\s*TODO:?\s*(.+)/i.test(line) || /\/\*\s*TODO:?\s*(.+?)\*\//i.test(line) || /#\s*TODO:?\s*(.+)/i.test(line)) {
                const match = line.match(/(?:\/\/|\/\*|#)\s*TODO:?\s*(.+?)(?:\*\/)?$/i);
                if (match) {
                    todos.push({
                        type: 'TODO',
                        text: match[1].trim(),
                        line: lineNumber
                    });
                }
            }
            // Detectar FIXME
            else if (/\/\/\s*FIXME:?\s*(.+)/i.test(line) || /\/\*\s*FIXME:?\s*(.+?)\*\//i.test(line) || /#\s*FIXME:?\s*(.+)/i.test(line)) {
                const match = line.match(/(?:\/\/|\/\*|#)\s*FIXME:?\s*(.+?)(?:\*\/)?$/i);
                if (match) {
                    todos.push({
                        type: 'FIXME',
                        text: match[1].trim(),
                        line: lineNumber
                    });
                }
            }
            // Detectar NOTE
            else if (/\/\/\s*NOTE:?\s*(.+)/i.test(line) || /\/\*\s*NOTE:?\s*(.+?)\*\//i.test(line)) {
                const match = line.match(/(?:\/\/|\/\*)\s*NOTE:?\s*(.+?)(?:\*\/)?$/i);
                if (match) {
                    todos.push({
                        type: 'NOTE',
                        text: match[1].trim(),
                        line: lineNumber
                    });
                }
            }
            // Detectar HACK
            else if (/\/\/\s*HACK:?\s*(.+)/i.test(line) || /\/\*\s*HACK:?\s*(.+?)\*\//i.test(line)) {
                const match = line.match(/(?:\/\/|\/\*)\s*HACK:?\s*(.+?)(?:\*\/)?$/i);
                if (match) {
                    todos.push({
                        type: 'HACK',
                        text: match[1].trim(),
                        line: lineNumber
                    });
                }
            }
            // Detectar XXX
            else if (/\/\/\s*XXX:?\s*(.+)/i.test(line) || /\/\*\s*XXX:?\s*(.+?)\*\//i.test(line)) {
                const match = line.match(/(?:\/\/|\/\*)\s*XXX:?\s*(.+?)(?:\*\/)?$/i);
                if (match) {
                    todos.push({
                        type: 'XXX',
                        text: match[1].trim(),
                        line: lineNumber
                    });
                }
            }
        });

        return {
            content, // Não modifica o conteúdo
            linesChanged: 0, // Apenas detecção
            todos
        };
    }

    /**
     * Gera relatório de TODOs
     */
    public generateReport(todos: TodoItem[], filePath: string): string {
        if (todos.length === 0) {
            return '';
        }

        let report = `📄 ${filePath} (${todos.length} item${todos.length !== 1 ? 's' : ''})\n\n`;

        // Agrupar por tipo
        const grouped = this.groupByType(todos);

        Object.entries(grouped).forEach(([type, items]) => {
            if (items.length > 0) {
                const icon = this.getTypeIcon(type as TodoType);
                report += `  ${icon} ${type} (${items.length}):\n`;
                
                items.forEach(item => {
                    report += `     Linha ${item.line}: ${item.text}\n`;
                });
                
                report += '\n';
            }
        });

        return report;
    }

    /**
     * Agrupa TODOs por tipo
     */
    public groupByType(todos: TodoItem[]): Record<string, TodoItem[]> {
        const grouped: Record<string, TodoItem[]> = {
            'TODO': [],
            'FIXME': [],
            'HACK': [],
            'NOTE': [],
            'XXX': []
        };

        todos.forEach(todo => {
            if (grouped[todo.type]) {
                grouped[todo.type].push(todo);
            }
        });

        return grouped;
    }

    /**
     * Retorna ícone para o tipo de TODO
     */
    public getTypeIcon(type: TodoType): string {
        const icons: Record<TodoType, string> = {
            'TODO': '📌',
            'FIXME': '🔴',
            'NOTE': '💡',
            'HACK': '⚠️',
            'XXX': '⚡'
        };
        return icons[type] || '📌';
    }
}