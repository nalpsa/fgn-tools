import * as vscode from 'vscode';
import { ToolManagerService } from '../../core/services/tool-manager.service';
import { WebviewManagerService } from '../../core/services/webview-manager.service';
import { ToolExecutorFactory } from '../../core/factories/tool-executor.factory';
import { DashboardTemplate } from './dashboard/dashboard.template';

/**
 * Serviço responsável pela interface do Toolbox
 * REFATORADO: Agora apenas gerencia o dashboard
 * 
 * Responsabilidade: APENAS dashboard principal
 * - Abrir dashboard
 * - Renderizar lista de tools
 * - Delegar execução para as tools
 * 
 * REMOVIDO (agora em outros lugares):
 * - ❌ Geração de HTML de tools específicas (agora nas tools)
 * - ❌ Gerenciamento de workspace (agora em WorkspaceService)
 * - ❌ Execução de tools (agora em ToolExecutorFactory)
 */
export class ToolboxUIService {
    private static instance: ToolboxUIService;
    private readonly context: vscode.ExtensionContext;
    private readonly toolManager: ToolManagerService;
    private readonly webviewManager: WebviewManagerService;
    private readonly executorFactory: ToolExecutorFactory;
    private readonly dashboardTemplate: DashboardTemplate;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.toolManager = ToolManagerService.getInstance();
        this.webviewManager = WebviewManagerService.getInstance();
        this.executorFactory = ToolExecutorFactory.getInstance();
        this.dashboardTemplate = new DashboardTemplate();
    }

    /**
     * Singleton pattern
     */
    public static getInstance(context?: vscode.ExtensionContext): ToolboxUIService {
        if (!ToolboxUIService.instance && context) {
            ToolboxUIService.instance = new ToolboxUIService(context);
        }
        return ToolboxUIService.instance;
    }

    /**
     * Abre o dashboard principal
     */
    public async openDashboard(): Promise<void> {
        const viewId = 'fgnToolsDashboard';

        // Criar ou mostrar webview
        const panel = this.webviewManager.createOrShowWebview({
            viewId,
            title: '🛠️ FGN Tools - Dashboard',
            column: vscode.ViewColumn.One,
            options: {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        });

        // Gerar HTML do dashboard
        const html = this.generateDashboardHTML();
        this.webviewManager.setHtml(viewId, html);

        // Configurar handlers de mensagens
        this.setupDashboardHandlers(viewId);

        console.log('✅ Dashboard aberto');
    }

    /**
     * Gera o HTML completo do dashboard
     */
    private generateDashboardHTML(): string {
        const tools = this.toolManager.getAllTools();
        const categories = this.toolManager.getAllCategoryMetadata();
        const toolsGrouped = this.toolManager.getToolsGroupedByCategory();

        // Usar template para gerar HTML
        return this.dashboardTemplate.getHTML(tools, categories, toolsGrouped);
    }

    /**
     * Configura handlers de mensagens do dashboard
     */
    private setupDashboardHandlers(viewId: string): void {
        this.webviewManager.onMessage(viewId, async (message) => {
            switch (message.command) {
                case 'executeTool':
                    await this.handleExecuteTool(message.data.toolId);
                    break;

                case 'refreshDashboard':
                    await this.handleRefreshDashboard(viewId);
                    break;

                case 'getToolInfo':
                    await this.handleGetToolInfo(viewId, message.data.toolId);
                    break;

                default:
                    console.warn(`Comando desconhecido: ${message.command}`);
            }
        });
    }

    /**
     * Handler: Executar uma tool
     */
    private async handleExecuteTool(toolId: string): Promise<void> {
        const tool = this.toolManager.getTool(toolId);
        
        if (!tool) {
            vscode.window.showErrorMessage(`Tool não encontrada: ${toolId}`);
            return;
        }

        console.log(`🎯 Executando tool: ${tool.name} (${toolId})`);

        // Criar executor e executar com UI
        const executor = this.executorFactory.createExecutor(tool);
        
        // Validar se pode executar
        const validation = this.executorFactory.canExecute(tool);
        if (!validation.canExecute) {
            vscode.window.showWarningMessage(validation.reason || 'Não é possível executar esta tool');
            return;
        }

        // Executar (a tool abrirá sua própria UI)
        await executor.executeWithUI();
    }

    /**
     * Handler: Atualizar dashboard
     */
    private async handleRefreshDashboard(viewId: string): Promise<void> {
        console.log('🔄 Atualizando dashboard...');
        
        const html = this.generateDashboardHTML();
        this.webviewManager.setHtml(viewId, html);

        // Enviar confirmação
        await this.webviewManager.sendMessage(viewId, {
            command: 'dashboardRefreshed',
            data: { timestamp: Date.now() }
        });
    }

    /**
     * Handler: Obter informações de uma tool
     */
    private async handleGetToolInfo(viewId: string, toolId: string): Promise<void> {
        const tool = this.toolManager.getTool(toolId);
        
        if (!tool) {
            await this.webviewManager.sendMessage(viewId, {
                command: 'toolInfo',
                data: { error: 'Tool não encontrada' }
            });
            return;
        }

        await this.webviewManager.sendMessage(viewId, {
            command: 'toolInfo',
            data: {
                id: tool.id,
                name: tool.name,
                description: tool.description,
                icon: tool.icon,
                category: tool.category
            }
        });
    }

    /**
     * Fecha o dashboard (se estiver aberto)
     */
    public closeDashboard(): void {
        this.webviewManager.disposeWebview('fgnToolsDashboard');
        console.log('📦 Dashboard fechado');
    }

    /**
     * Verifica se o dashboard está aberto
     */
    public isDashboardOpen(): boolean {
        return this.webviewManager.hasWebview('fgnToolsDashboard');
    }
}