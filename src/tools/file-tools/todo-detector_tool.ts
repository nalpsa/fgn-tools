import * as vscode from 'vscode';
import { ToolConfig, ToolResult, ToolCategory } from '../../core/interfaces/tool.interface';
import { IFileProcessingStrategy, FileSelectionInput } from '../../core/interfaces/file-processor.interface';
import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { TodoDetectorStrategy, TodoItem } from '../../core/strategies/todo-detector.strategy';

/**
 * Tool para detecção de TODOs
 * Herda de BaseFileTool mas sobrescreve processFiles para gerar relatório
 * 
 * Responsabilidade: Detectar e reportar TODOs
 * - Define ID, nome, descrição
 * - Retorna strategy de detecção
 * - Gera relatório consolidado
 * - Agrupa TODOs por tipo
 */
export class TodoDetectorTool extends BaseFileTool {
    readonly id = 'todo-detector';
    readonly name = 'Detector de TODOs';
    readonly description = 'Detecta e lista TODOs, FIXMEs e NOTEs no código';
    readonly icon = 'checklist';
    readonly category = ToolCategory.CODE;

    // Strategy tipada como propriedade
    private strategy: TodoDetectorStrategy;

    constructor() {
        super();
        this.strategy = new TodoDetectorStrategy();
    }

    /**
     * Retorna a strategy de detecção de TODOs
     */
    protected getStrategy(): IFileProcessingStrategy {
        return this.strategy;
    }

    /**
     * Configuração da UI
     */
    protected getToolConfig(): ToolConfig {
        return {
            icon: 'checklist',
            title: this.name,
            description: this.description,
            confirmMessage: '📋 Esta ação detectará TODOs, FIXMEs e NOTEs nos arquivos selecionados.\n\nDeseja continuar?',
            successMessage: '✅ TODOs detectados com sucesso!',
            errorMessage: '❌ Erro ao detectar TODOs',
            buttonText: 'Detectar TODOs',
            buttonIcon: 'checklist',
            fileExtensions: [
                '.js', '.jsx',
                '.ts', '.tsx',
                '.java',
                '.py',
                '.php',
                '.c', '.cpp', '.h',
                '.go',
                '.rs',
                '.swift',
                '.kt',
                '.html',
                '.css', '.scss',
                '.md'
            ]
        };
    }

    /**
     * Sobrescreve processFiles para gerar relatório de TODOs
     */
    protected async processFiles(input: FileSelectionInput): Promise<ToolResult> {
        const workspacePath = this.workspaceService.getWorkspaceRoot();
        
        if (!workspacePath) {
            return {
                success: false,
                error: 'Nenhum workspace aberto'
            };
        }

        console.log(`🔍 ${this.name} - Detectando TODOs...`);

        const allTodos: Array<{ file: string; todos: TodoItem[] }> = [];

        try {
            // Processar cada seleção
            for (const selection of input.selections) {
                if (!selection.selected) continue;

                const fullPath = `${workspacePath}/${selection.path}`;

                if (selection.type === 'folder') {
                    // Processar pasta recursivamente
                    await this.processFolderForTodos(fullPath, allTodos);
                } else {
                    // Processar arquivo único
                    await this.processSingleFileForTodos(fullPath, selection.path, allTodos);
                }
            }

            // Calcular estatísticas
            const totalTodos = allTodos.reduce((sum, item) => sum + item.todos.length, 0);

            // Gerar relatório
            const report = this.generateFullReport(allTodos, totalTodos);

            // Salvar relatório em arquivo
            await this.saveReport(report, workspacePath);

            console.log(`✅ Detecção concluída: ${totalTodos} TODO(s) encontrado(s)`);

            return {
                success: true,
                output: report,
                stats: {
                    filesProcessed: allTodos.length,
                    totalTodos
                }
            };

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`❌ Erro na detecção:`, errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Processa pasta recursivamente detectando TODOs
     */
    private async processFolderForTodos(
        folderPath: string,
        allTodos: Array<{ file: string; todos: TodoItem[] }>
    ): Promise<void> {
        const config = this.getToolConfig();
        
        await this.fileSystemService.processFolder(
            folderPath,
            async (filePath) => {
                const relativePath = this.workspaceService.asRelativePath(filePath);
                await this.processSingleFileForTodos(filePath, relativePath, allTodos);
            },
            {
                includeExtensions: config.fileExtensions
            }
        );
    }

    /**
     * Processa um único arquivo detectando TODOs
     */
    private async processSingleFileForTodos(
        filePath: string,
        relativePath: string,
        allTodos: Array<{ file: string; todos: TodoItem[] }>
    ): Promise<void> {
        try {
            const content = await this.fileSystemService.readFile(filePath);
            const result = this.strategy.processFile(content);
            
            if (result.todos && result.todos.length > 0) {
                allTodos.push({
                    file: relativePath,
                    todos: result.todos
                });
            }
        } catch (error) {
            console.error(`Erro ao processar ${relativePath}:`, error);
        }
    }

    /**
     * Gera relatório completo de TODOs
     */
    private generateFullReport(
        allTodos: Array<{ file: string; todos: TodoItem[] }>,
        totalTodos: number
    ): string {
        let report = '═══════════════════════════════════════════\n';
        report += '  🔍 RELATÓRIO DE TODOs E PENDÊNCIAS\n';
        report += '═══════════════════════════════════════════\n\n';
        
        // Resumo geral
        const allItems = allTodos.flatMap(a => a.todos);
        const byType = {
            TODO: allItems.filter(t => t.type === 'TODO').length,
            FIXME: allItems.filter(t => t.type === 'FIXME').length,
            NOTE: allItems.filter(t => t.type === 'NOTE').length,
            HACK: allItems.filter(t => t.type === 'HACK').length,
            XXX: allItems.filter(t => t.type === 'XXX').length
        };

        report += `📊 Resumo Geral:\n`;
        report += `   • Total de itens: ${totalTodos}\n`;
        report += `   • Arquivos com pendências: ${allTodos.length}\n\n`;
        
        report += `📋 Por Tipo:\n`;
        if (byType.TODO > 0) report += `   • TODO:  ${byType.TODO} (tarefas planejadas)\n`;
        if (byType.FIXME > 0) report += `   • FIXME: ${byType.FIXME} (correções necessárias)\n`;
        if (byType.HACK > 0) report += `   • HACK:  ${byType.HACK} (soluções temporárias)\n`;
        if (byType.NOTE > 0) report += `   • NOTE:  ${byType.NOTE} (observações)\n`;
        if (byType.XXX > 0) report += `   • XXX:   ${byType.XXX} (atenção especial)\n`;
        report += '\n';

        if (totalTodos === 0) {
            report += '✅ Nenhum TODO, FIXME ou NOTE encontrado!\n';
            return report;
        }

        // FIXMEs prioritários
        const fixmes = allItems.filter(t => t.type === 'FIXME');
        if (fixmes.length > 0) {
            report += '🔴 FIXME - CORREÇÕES PRIORITÁRIAS:\n\n';
            fixmes.forEach(item => {
                const file = allTodos.find(a => a.todos.includes(item))?.file || 'unknown';
                report += `   🔴 ${file}:${item.line}\n`;
                report += `      ${item.text}\n\n`;
            });
            report += '───────────────────────────────────────────\n\n';
        }

        // Relatório detalhado por arquivo
        allTodos.forEach(item => {
            if (item.todos.length > 0) {
                report += this.strategy.generateReport(item.todos, item.file);
            }
        });

        report += '═══════════════════════════════════════════\n';
        report += '\n📚 Legenda:\n';
        report += '   📌 TODO:  Tarefas planejadas para implementar\n';
        report += '   🔴 FIXME: Bugs ou problemas que precisam correção\n';
        report += '   ⚠️  HACK:  Soluções temporárias que precisam revisão\n';
        report += '   💡 NOTE:  Observações e documentação importante\n';
        report += '   ⚡ XXX:   Requer atenção especial urgente\n';

        return report;
    }

    /**
     * Salva relatório em arquivo
     */
    private async saveReport(report: string, workspacePath: string): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const reportPath = `${workspacePath}/TODO-REPORT-${timestamp}.txt`;
        
        try {
            await this.fileSystemService.writeFile(reportPath, report);
            console.log(`📄 Relatório salvo em: ${reportPath}`);
            
            // Abrir o relatório no editor
            const uri = vscode.Uri.file(reportPath);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
            
        } catch (error) {
            console.error('Erro ao salvar relatório:', error);
        }
    }
}