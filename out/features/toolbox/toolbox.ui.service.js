"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolboxUIService = void 0;
const vscode = __importStar(require("vscode"));
const tool_manager_service_1 = require("../../core/services/tool-manager.service");
const toolbox_html_template_1 = require("./toolbox.html.template");
/**
 * Serviço responsável pela interface visual do dashboard
 * Princípio da Responsabilidade Única (SRP): gerencia apenas a UI
 */
class ToolboxUIService {
    constructor() {
        this.toolManager = tool_manager_service_1.ToolManagerService.getInstance();
    }
    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!ToolboxUIService.instance) {
            ToolboxUIService.instance = new ToolboxUIService();
        }
        return ToolboxUIService.instance;
    }
    /**
     * Abre o dashboard de ferramentas
     */
    openDashboard() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.panel = vscode.window.createWebviewPanel('fgnToolbox', '🛠️ FGN Tools - Dashboard', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        });
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
    closeDashboard() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }
    /**
     * Atualiza o conteúdo do dashboard
     */
    refreshDashboard() {
        if (this.panel) {
            this.panel.webview.html = this.getWebviewContent();
        }
    }
    /**
     * Configura o listener de mensagens da webview
     */
    setupMessageListener() {
        if (!this.panel)
            return;
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
    async handleExecuteTool(toolId) {
        try {
            await this.toolManager.executeTool(toolId);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error: ${errorMessage}`);
        }
    }
    /**
     * Envia dados do dashboard para a webview
     */
    async handleGetDashboardData() {
        if (!this.panel)
            return;
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
    getWebviewContent() {
        const toolsGrouped = this.toolManager.getToolsGroupedByCategory();
        const categories = this.toolManager.getAllCategoryMetadata();
        return (0, toolbox_html_template_1.getToolboxHtmlTemplate)(categories, toolsGrouped);
    }
}
exports.ToolboxUIService = ToolboxUIService;
//# sourceMappingURL=toolbox.ui.service.js.map