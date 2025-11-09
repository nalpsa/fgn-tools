import * as vscode from 'vscode';
import { ITool, ToolResult } from '../interfaces/tool.interface';
import { FileSelectionInput } from '../interfaces/file-processor.interface';
import { WorkspaceService } from '../services/workspace.service';
import { WebviewManagerService } from '../services/webview-manager.service';

/**
 * Factory para criar executores de ferramentas
 * Seguindo o Factory Pattern e SRP
 * 
 * Responsabilidade: Criar e configurar executores de tools
 * - Criar executores com UI
 * - Criar executores em background
 * - Gerenciar ciclo de vida da execução
 */
export class ToolExecutorFactory {
    private static instance: ToolExecutorFactory;
    private workspaceService: WorkspaceService;
    private webviewManager: WebviewManagerService;

    private constructor() {
        this.workspaceService = WorkspaceService.getInstance();
        this.webviewManager = WebviewManagerService.getInstance();
    }

    /**
     * Singleton pattern
     */
    public static getInstance(): ToolExecutorFactory {
        if (!ToolExecutorFactory.instance) {
            ToolExecutorFactory.instance = new ToolExecutorFactory();
        }
        return ToolExecutorFactory.instance;
    }

    /**
     * Cria um executor para uma tool
     * @param tool Tool a ser executada
     * @returns Objeto executor com métodos execute
     */
    public createExecutor(tool: ITool): ToolExecutor {
        return {
            executeWithUI: () => this.executeWithUI(tool),
            executeInBackground: (input: any) => this.executeInBackground(tool, input),
            executeDirect: (input: any) => tool.execute(input)
        };
    }

    /**
     * Executa uma tool com interface de usuário
     * @param tool Tool a ser executada
     */
    private async executeWithUI(tool: ITool): Promise<ToolResult> {
        try {
            // Verificar se há workspace aberto
            if (!this.workspaceService.hasWorkspace()) {
                vscode.window.showErrorMessage('Nenhum workspace aberto. Abra uma pasta primeiro.');
                return {
                    success: false,
                    error: 'Nenhum workspace aberto'
                };
            }

            // Delegar execução para a tool
            // A tool é responsável por abrir sua própria UI
            return await tool.execute({});

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`Erro ao executar tool ${tool.id}:`, error);
            vscode.window.showErrorMessage(`Erro: ${errorMessage}`);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Executa uma tool em background sem UI
     * @param tool Tool a ser executada
     * @param input Dados de entrada
     */
    private async executeInBackground(tool: ITool, input: any): Promise<ToolResult> {
        try {
            console.log(`🔧 Executando ${tool.name} em background...`);
            
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Executando ${tool.name}...`,
                cancellable: false
            }, async () => {
                return await tool.execute(input);
            });

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`Erro ao executar tool ${tool.id} em background:`, error);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Executa uma tool com seleção de arquivos
     * @param tool Tool a ser executada
     * @param selections Arquivos/pastas selecionados
     */
    public async executeWithFileSelection(
        tool: ITool,
        selections: FileSelectionInput
    ): Promise<ToolResult> {
        try {
            console.log(`📁 Executando ${tool.name} com ${selections.selections.length} seleções...`);

            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Processando arquivos com ${tool.name}...`,
                cancellable: false
            }, async (progress) => {
                // Atualizar progresso
                progress.report({ message: 'Iniciando processamento...' });

                // Executar tool
                const result = await tool.execute(selections);

                // Mostrar resultado
                if (result.success) {
                    const stats = result.stats;
                    const message = stats?.filesProcessed 
                        ? `✅ ${stats.filesProcessed} arquivo(s) processado(s)`
                        : '✅ Processamento concluído';
                    
                    vscode.window.showInformationMessage(message);
                } else {
                    vscode.window.showErrorMessage(`❌ Erro: ${result.error}`);
                }

                return result;
            });

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`Erro ao executar tool ${tool.id} com seleção:`, error);
            vscode.window.showErrorMessage(`❌ Erro: ${errorMessage}`);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Valida se uma tool pode ser executada
     * @param tool Tool a validar
     */
    public canExecute(tool: ITool): { canExecute: boolean; reason?: string } {
        // Verificar workspace
        if (!this.workspaceService.hasWorkspace()) {
            return {
                canExecute: false,
                reason: 'Nenhum workspace aberto'
            };
        }

        // Tool específica pode ter suas próprias validações
        // Mas por padrão, se há workspace, pode executar
        return { canExecute: true };
    }

    /**
     * Obtém mensagem de erro de forma segura
     */
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}

/**
 * Interface para executor de tool
 */
export interface ToolExecutor {
    /**
     * Executa com interface de usuário
     */
    executeWithUI(): Promise<ToolResult>;

    /**
     * Executa em background sem UI
     */
    executeInBackground(input: any): Promise<ToolResult>;

    /**
     * Executa diretamente (delega para tool.execute)
     */
    executeDirect(input: any): Promise<ToolResult>;
}