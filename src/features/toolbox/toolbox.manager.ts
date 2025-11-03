import * as vscode from 'vscode';
import { ToolManager } from '../../core/services/tool-manager.service';
import { ToolboxUI } from './toolbox.ui.service';

export class ToolboxManager {
    private static instance: ToolboxManager;
    private toolManager: ToolManager;
    private toolboxUI: ToolboxUI;
    private panel: vscode.WebviewPanel | undefined;

    private constructor(context: vscode.ExtensionContext) {
        this.toolManager = new ToolManager();
        this.toolboxUI = new ToolboxUI(context);
    }

    public static getInstance(context: vscode.ExtensionContext): ToolboxManager {
        if (!ToolboxManager.instance) {
            ToolboxManager.instance = new ToolboxManager(context);
        }
        return ToolboxManager.instance;
    }

    public registerTool(tool: any): void {
        this.toolManager.registerTool(tool);
    }

    public async openDashboard(): Promise<void> {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = await this.toolboxUI.createDashboardPanel(this.toolManager);
        
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    public async openToolModal(toolId: string): Promise<void> {
        const tool = this.toolManager.getTool(toolId);
        if (!tool) {
            vscode.window.showErrorMessage(`Ferramenta não encontrada: ${toolId}`);
            return;
        }

        await this.toolboxUI.createToolModal(tool, this.toolManager);
    }

    public getToolManager(): ToolManager {
        return this.toolManager;
    }
}