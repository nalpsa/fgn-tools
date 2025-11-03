import * as vscode from 'vscode';
import { ToolManagerService } from '../../core/services/tool-manager.service';
import { getToolboxHtmlTemplate } from './toolbox.html.template';

/**
 * Serviço responsável pela interface visual do dashboard
 * Princípio da Responsabilidade Única (SRP): gerencia apenas a UI
 */
export class ToolboxUIService {
    private static instance: ToolboxUIService;
    private panel: vscode.WebviewPanel | undefined;
    private readonly toolManager: ToolManagerService;

    private constructor() {
        this.toolManager = ToolManagerService.getInstance();
    }

    /**
     * Singleton pattern
     */
    public static getInstance(): ToolboxUIService {
        if (!ToolboxUIService.instance) {
            ToolboxUIService.instance = new ToolboxUIService();
        }
        return ToolboxUIService.instance;
    }

    /**
     * Abre o dashboard de ferramentas
     */
    public openDashboard(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'fgnToolbox',
            '🛠️ FGN Tools - Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageListener();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
            console.log('📦 Dashboard closed');
        });

        console.log('✅ Dashboard opened');
    }

    /**
     * Fecha o dashboard
     */
    public closeDashboard(): void {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }

    /**
     * Atualiza o conteúdo do dashboard
     */
    public refreshDashboard(): void {
        if (this.panel) {
            this.panel.webview.html = this.getWebviewContent();
        }
    }

    /**
     * Configura o listener de mensagens da webview
     */
    private setupMessageListener(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(async (message) => {
            console.log('📨 Message received:', message.command);

            switch (message.command) {
                case 'executeTool':
                    await this.handleExecuteTool(message.toolId);
                    break;

                case 'getDashboardData':
                    await this.handleGetDashboardData();
                    break;

                case 'refreshDashboard':
                    this.refreshDashboard();
                    break;

                default:
                    console.warn('Unknown command:', message.command);
            }
        });
    }

    /**
     * Manipula a execução de uma ferramenta
     */
    private async handleExecuteTool(toolId: string): Promise<void> {
        try {
            await this.toolManager.executeTool(toolId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error: ${errorMessage}`);
        }
    }

    /**
     * Envia dados do dashboard para a webview
     */
    private async handleGetDashboardData(): Promise<void> {
        if (!this.panel) return;

        const toolsGrouped = this.toolManager.getToolsGroupedByCategory();
        const categories = this.toolManager.getAllCategoryMetadata();

        const dashboardData = {
            categories: categories,
            tools: Array.from(toolsGrouped.entries()).map(([category, tools]) => ({
                category,
                tools: tools.map(tool => ({
                    id: tool.id,
                    name: tool.name,
                    description: tool.description,
                    icon: tool.icon,
                    category: tool.category
                }))
            }))
        };

        this.panel.webview.postMessage({
            command: 'dashboardData',
            data: dashboardData
        });
    }

    /**
     * Gera o HTML do dashboard
     */
    private getWebviewContent(): string {
        const toolsGrouped = this.toolManager.getToolsGroupedByCategory();
        const categories = this.toolManager.getAllCategoryMetadata();

        return getToolboxHtmlTemplate(categories, toolsGrouped);
    }
}