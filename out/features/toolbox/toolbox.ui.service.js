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
const webview_manager_service_1 = require("../../core/services/webview-manager.service");
const tool_executor_factory_1 = require("../../core/factories/tool-executor.factory");
const dashboard_template_1 = require("./dashboard/dashboard.template");
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
class ToolboxUIService {
    constructor(context) {
        this.context = context;
        this.toolManager = tool_manager_service_1.ToolManagerService.getInstance();
        this.webviewManager = webview_manager_service_1.WebviewManagerService.getInstance();
        this.executorFactory = tool_executor_factory_1.ToolExecutorFactory.getInstance();
        this.dashboardTemplate = new dashboard_template_1.DashboardTemplate();
    }
    /**
     * Singleton pattern
     */
    static getInstance(context) {
        if (!ToolboxUIService.instance && context) {
            ToolboxUIService.instance = new ToolboxUIService(context);
        }
        return ToolboxUIService.instance;
    }
    /**
     * Abre o dashboard principal
     */
    async openDashboard() {
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
    generateDashboardHTML() {
        const tools = this.toolManager.getAllTools();
        const categories = this.toolManager.getAllCategoryMetadata();
        const toolsGrouped = this.toolManager.getToolsGroupedByCategory();
        // Usar template para gerar HTML
        return this.dashboardTemplate.getHTML(tools, categories, toolsGrouped);
    }
    /**
     * Configura handlers de mensagens do dashboard
     */
    setupDashboardHandlers(viewId) {
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
    async handleExecuteTool(toolId) {
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
    async handleRefreshDashboard(viewId) {
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
    async handleGetToolInfo(viewId, toolId) {
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
    closeDashboard() {
        this.webviewManager.disposeWebview('fgnToolsDashboard');
        console.log('📦 Dashboard fechado');
    }
    /**
     * Verifica se o dashboard está aberto
     */
    isDashboardOpen() {
        return this.webviewManager.hasWebview('fgnToolsDashboard');
    }
}
exports.ToolboxUIService = ToolboxUIService;
//# sourceMappingURL=toolbox.ui.service.js.map