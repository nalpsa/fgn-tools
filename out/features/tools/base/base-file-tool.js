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
exports.BaseFileTool = void 0;
const vscode = __importStar(require("vscode"));
const workspace_service_1 = require("../../../core/services/workspace.service");
const webview_manager_service_1 = require("../../../core/services/webview-manager.service");
const file_system_service_1 = require("../../../core/services/file-system.service");
const file_selector_template_1 = require("../../toolbox/file-selector/file-selector.template");
/**
 * Classe base abstrata para ferramentas que processam arquivos
 * Implementa o Template Method Pattern
 *
 * Responsabilidade: Comportamento comum de todas as file tools
 * - Abrir UI de seleÃ§Ã£o
 * - Processar arquivos selecionados
 * - Aplicar strategy de processamento
 * - Retornar resultados
 *
 * Subclasses devem implementar apenas:
 * - getStrategy(): Retorna a strategy de processamento
 * - getToolConfig(): Retorna a configuraÃ§Ã£o da UI
 */
class BaseFileTool {
    constructor() {
        this.workspaceService = workspace_service_1.WorkspaceService.getInstance();
        this.webviewManager = webview_manager_service_1.WebviewManagerService.getInstance();
        this.fileSystemService = file_system_service_1.FileSystemService.getInstance();
        this.fileSelectorTemplate = new file_selector_template_1.FileSelectorTemplate();
    }
    /**
     * Template Method: Executa a tool
     * Este mÃ©todo define o skeleton do algoritmo
     */
    async execute(input) {
        try {
            // Se input foi fornecido, processar diretamente
            if (input && input.selections) {
                return await this.processFiles(input);
            }
            // Caso contrÃ¡rio, abrir UI para seleÃ§Ã£o
            await this.openUI();
            return {
                success: true,
                output: 'UI aberta para seleÃ§Ã£o de arquivos'
            };
        }
        catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`âŒ Erro no ${this.name}:`, errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * Abre a UI de seleÃ§Ã£o de arquivos
     */
    async openUI() {
        const viewId = `${this.id}-selector`;
        const config = this.getToolConfig();
        // Criar webview
        const panel = this.webviewManager.createOrShowWebview({
            viewId,
            title: config.title,
            column: vscode.ViewColumn.Two,
            options: {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        });
        // Gerar HTML
        const html = this.fileSelectorTemplate.getHTML(config);
        this.webviewManager.setHtml(viewId, html);
        // Configurar handlers
        this.setupMessageHandlers(viewId);
        console.log(`âœ… UI aberta: ${this.name}`);
    }
    /**
     * Configura os handlers de mensagens do webview
     */
    setupMessageHandlers(viewId) {
        this.webviewManager.onMessage(viewId, async (message) => {
            switch (message.command) {
                case 'getWorkspaceFiles':
                    await this.handleGetWorkspaceFiles(viewId);
                    break;
                case 'confirmExecution':
                    await this.handleConfirmExecution(viewId, message.data);
                    break;
                case 'execute':
                    await this.handleExecute(viewId, message.data);
                    break;
                default:
                    console.warn(`Comando desconhecido: ${message.command}`);
            }
        });
    }
    /**
     * Handler: Obter arquivos do workspace
     */
    async handleGetWorkspaceFiles(viewId) {
        try {
            const config = this.getToolConfig();
            const files = await this.workspaceService.getWorkspaceFilesStructure({
                includeExtensions: config.fileExtensions
            });
            await this.webviewManager.sendMessage(viewId, {
                command: 'workspaceFiles',
                data: { files }
            });
        }
        catch (error) {
            console.error('Erro ao obter arquivos:', error);
            await this.webviewManager.sendMessage(viewId, {
                command: 'workspaceFiles',
                data: { files: [] }
            });
        }
    }
    /**
     * Handler: Confirmar execuÃ§Ã£o (mostra diÃ¡logo nativo do VS Code)
     */
    async handleConfirmExecution(viewId, data) {
        const config = this.getToolConfig();
        // Mostrar diÃ¡logo de confirmaÃ§Ã£o
        const confirmed = await vscode.window.showWarningMessage(config.confirmMessage, { modal: true }, 'Sim, executar');
        if (confirmed === 'Sim, executar') {
            // Notificar webview que execuÃ§Ã£o iniciou
            await this.webviewManager.sendMessage(viewId, {
                command: 'executionStarted'
            });
            // Executar processamento
            const result = await this.processFiles(data);
            // Enviar resultado
            await this.webviewManager.sendMessage(viewId, {
                command: 'executionResult',
                data: { result }
            });
        }
    }
    /**
     * Handler: Executar sem confirmaÃ§Ã£o (fallback)
     */
    async handleExecute(viewId, data) {
        const result = await this.processFiles(data);
        await this.webviewManager.sendMessage(viewId, {
            command: 'executionResult',
            data: { result }
        });
    }
    /**
     * Processa os arquivos selecionados
     * Este Ã© o mÃ©todo principal que aplica a strategy
     */
    async processFiles(input) {
        const workspacePath = this.workspaceService.getWorkspaceRoot();
        if (!workspacePath) {
            return {
                success: false,
                error: 'Nenhum workspace aberto'
            };
        }
        console.log(`ðŸ”§ ${this.name} - Processando arquivos...`);
        console.log(`ðŸ“‚ Workspace: ${workspacePath}`);
        console.log(`ðŸ“„ SeleÃ§Ãµes: ${input.selections.length}`);
        const strategy = this.getStrategy();
        const processedFiles = [];
        let totalLinesChanged = 0;
        try {
            // Processar cada seleÃ§Ã£o
            for (const selection of input.selections) {
                if (!selection.selected) {
                    continue;
                }
                const fullPath = `${workspacePath}/${selection.path}`;
                if (selection.type === 'folder') {
                    // Processar pasta recursivamente
                    const result = await this.processFolderRecursively(fullPath, strategy);
                    processedFiles.push(...result.files);
                    totalLinesChanged += result.totalLines;
                }
                else {
                    // Processar arquivo Ãºnico
                    const result = await this.processSingleFile(fullPath, strategy);
                    if (result) {
                        processedFiles.push(result);
                        if (result.success && result.result) {
                            totalLinesChanged += result.result.linesChanged;
                        }
                    }
                }
            }
            const successCount = processedFiles.filter(f => f.success).length;
            const errorCount = processedFiles.filter(f => !f.success).length;
            console.log(`âœ… Processamento concluÃ­do:`);
            console.log(`   - ${successCount} arquivo(s) processado(s) com sucesso`);
            console.log(`   - ${totalLinesChanged} linha(s) modificada(s)`);
            if (errorCount > 0) {
                console.log(`   - ${errorCount} erro(s)`);
            }
            return {
                success: true,
                stats: {
                    filesProcessed: successCount,
                    linesChanged: totalLinesChanged
                }
            };
        }
        catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`âŒ Erro no processamento:`, errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * Processa uma pasta recursivamente
     */
    async processFolderRecursively(folderPath, strategy) {
        const files = [];
        let totalLines = 0;
        const config = this.getToolConfig();
        const result = await this.fileSystemService.processFolder(folderPath, async (filePath) => {
            const processed = await this.processSingleFile(filePath, strategy);
            if (processed) {
                files.push(processed);
                if (processed.success && processed.result) {
                    totalLines += processed.result.linesChanged;
                }
            }
        }, {
            includeExtensions: config.fileExtensions
        });
        return { files, totalLines };
    }
    /**
     * Processa um Ãºnico arquivo
     */
    async processSingleFile(filePath, strategy) {
        try {
            // Ler arquivo
            const content = await this.fileSystemService.readFile(filePath);
            // Aplicar strategy
            const processResult = strategy.processFile(content);
            // Se houve mudanÃ§as, escrever de volta
            if (processResult.linesChanged > 0) {
                await this.fileSystemService.writeFile(filePath, processResult.content);
            }
            return {
                path: filePath,
                name: filePath.split('/').pop() || filePath,
                success: true,
                result: processResult
            };
        }
        catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`âŒ Erro ao processar ${filePath}:`, errorMessage);
            return {
                path: filePath,
                name: filePath.split('/').pop() || filePath,
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * Extrai mensagem de erro de forma segura
     */
    getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
exports.BaseFileTool = BaseFileTool;
//# sourceMappingURL=base-file-tool.js.map