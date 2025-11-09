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
exports.ToolExecutorFactory = void 0;
const vscode = __importStar(require("vscode"));
const workspace_service_1 = require("../services/workspace.service");
const webview_manager_service_1 = require("../services/webview-manager.service");
/**
 * Factory para criar executores de ferramentas
 * Seguindo o Factory Pattern e SRP
 *
 * Responsabilidade: Criar e configurar executores de tools
 * - Criar executores com UI
 * - Criar executores em background
 * - Gerenciar ciclo de vida da execução
 */
class ToolExecutorFactory {
    constructor() {
        this.workspaceService = workspace_service_1.WorkspaceService.getInstance();
        this.webviewManager = webview_manager_service_1.WebviewManagerService.getInstance();
    }
    /**
     * Singleton pattern
     */
    static getInstance() {
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
    createExecutor(tool) {
        return {
            executeWithUI: () => this.executeWithUI(tool),
            executeInBackground: (input) => this.executeInBackground(tool, input),
            executeDirect: (input) => tool.execute(input)
        };
    }
    /**
     * Executa uma tool com interface de usuário
     * @param tool Tool a ser executada
     */
    async executeWithUI(tool) {
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
        }
        catch (error) {
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
    async executeInBackground(tool, input) {
        try {
            console.log(`🔧 Executando ${tool.name} em background...`);
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Executando ${tool.name}...`,
                cancellable: false
            }, async () => {
                return await tool.execute(input);
            });
        }
        catch (error) {
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
    async executeWithFileSelection(tool, selections) {
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
                }
                else {
                    vscode.window.showErrorMessage(`❌ Erro: ${result.error}`);
                }
                return result;
            });
        }
        catch (error) {
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
    canExecute(tool) {
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
    getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
exports.ToolExecutorFactory = ToolExecutorFactory;
//# sourceMappingURL=tool-executor.factory.js.map