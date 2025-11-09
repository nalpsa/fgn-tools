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
exports.WebviewManagerService = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Serviço para gerenciamento de webviews
 * Seguindo o Princípio da Responsabilidade Única (SRP)
 *
 * Responsabilidade: APENAS gerenciar ciclo de vida de webviews
 * - Criar webviews
 * - Enviar mensagens
 * - Receber mensagens
 * - Gerenciar disposables
 */
class WebviewManagerService {
    constructor() {
        this.panels = new Map();
        this.disposables = new Map();
    }
    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!WebviewManagerService.instance) {
            WebviewManagerService.instance = new WebviewManagerService();
        }
        return WebviewManagerService.instance;
    }
    /**
     * Inicializa o serviço com o contexto da extensão
     */
    initialize(context) {
        this.context = context;
    }
    /**
     * Cria ou revela um webview panel
     * @param config Configuração do webview
     * @returns WebviewPanel criado ou existente
     */
    createOrShowWebview(config) {
        // Verificar se já existe um panel com este ID
        const existingPanel = this.panels.get(config.viewId);
        if (existingPanel) {
            existingPanel.reveal(config.column || vscode.ViewColumn.Two);
            return existingPanel;
        }
        // Criar novo panel
        const panel = vscode.window.createWebviewPanel(config.viewId, config.title, config.column || vscode.ViewColumn.Two, {
            enableScripts: config.options?.enableScripts ?? true,
            retainContextWhenHidden: config.options?.retainContextWhenHidden ?? true,
            localResourceRoots: config.options?.localResourceRoots || []
        });
        // Registrar panel
        this.panels.set(config.viewId, panel);
        this.disposables.set(config.viewId, []);
        // Configurar listener de dispose
        const disposeListener = panel.onDidDispose(() => {
            this.disposeWebview(config.viewId);
        });
        this.addDisposable(config.viewId, disposeListener);
        console.log(`✅ Webview criado: ${config.viewId}`);
        return panel;
    }
    /**
     * Obtém um webview panel existente
     * @param viewId ID do webview
     */
    getWebview(viewId) {
        return this.panels.get(viewId);
    }
    /**
     * Verifica se um webview existe e está ativo
     * @param viewId ID do webview
     */
    hasWebview(viewId) {
        return this.panels.has(viewId);
    }
    /**
     * Define o HTML de um webview
     * @param viewId ID do webview
     * @param html Conteúdo HTML
     */
    setHtml(viewId, html) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            throw new Error(`Webview ${viewId} não encontrado`);
        }
        panel.webview.html = html;
    }
    /**
     * Envia uma mensagem para o webview
     * @param viewId ID do webview
     * @param message Mensagem a ser enviada
     */
    async sendMessage(viewId, message) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            console.warn(`⚠️  Webview ${viewId} não encontrado para enviar mensagem`);
            return false;
        }
        try {
            await panel.webview.postMessage(message);
            return true;
        }
        catch (error) {
            console.error(`Erro ao enviar mensagem para ${viewId}:`, error);
            return false;
        }
    }
    /**
     * Registra um handler para mensagens recebidas do webview
     * @param viewId ID do webview
     * @param handler Função para processar mensagens
     */
    onMessage(viewId, handler) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            throw new Error(`Webview ${viewId} não encontrado`);
        }
        const listener = panel.webview.onDidReceiveMessage(async (message) => {
            try {
                await handler(message);
            }
            catch (error) {
                console.error(`Erro ao processar mensagem do webview ${viewId}:`, error);
            }
        });
        this.addDisposable(viewId, listener);
    }
    /**
     * Dispõe de um webview e seus recursos
     * @param viewId ID do webview
     */
    disposeWebview(viewId) {
        // Dispor de todos os disposables
        const disposables = this.disposables.get(viewId);
        if (disposables) {
            disposables.forEach(d => {
                try {
                    d.dispose();
                }
                catch (error) {
                    console.error(`Erro ao dispor disposable de ${viewId}:`, error);
                }
            });
            this.disposables.delete(viewId);
        }
        // Remover panel
        const panel = this.panels.get(viewId);
        if (panel) {
            try {
                panel.dispose();
            }
            catch (error) {
                console.error(`Erro ao dispor panel ${viewId}:`, error);
            }
            this.panels.delete(viewId);
        }
        console.log(`🗑️  Webview disposed: ${viewId}`);
    }
    /**
     * Dispõe de todos os webviews
     */
    disposeAll() {
        const viewIds = Array.from(this.panels.keys());
        viewIds.forEach(viewId => this.disposeWebview(viewId));
        console.log('🧹 Todos os webviews foram disposed');
    }
    /**
     * Obtém o número de webviews ativos
     */
    getActiveWebviewCount() {
        return this.panels.size;
    }
    /**
     * Revela um webview existente
     * @param viewId ID do webview
     * @param column Coluna onde revelar (opcional)
     */
    reveal(viewId, column) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            return false;
        }
        panel.reveal(column || vscode.ViewColumn.Two);
        return true;
    }
    /**
     * Obtém a URI de um recurso local para uso no webview
     * @param viewId ID do webview
     * @param resourcePath Caminho do recurso
     */
    getResourceUri(viewId, resourcePath) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            return undefined;
        }
        return panel.webview.asWebviewUri(resourcePath);
    }
    /**
     * Define o ícone do webview panel
     * @param viewId ID do webview
     * @param iconPath Caminho do ícone
     */
    setIconPath(viewId, iconPath) {
        const panel = this.panels.get(viewId);
        if (!panel) {
            throw new Error(`Webview ${viewId} não encontrado`);
        }
        panel.iconPath = iconPath;
    }
    /**
     * Adiciona um disposable ao registro de um webview
     * @param viewId ID do webview
     * @param disposable Disposable a ser registrado
     */
    addDisposable(viewId, disposable) {
        const disposables = this.disposables.get(viewId) || [];
        disposables.push(disposable);
        this.disposables.set(viewId, disposables);
        // Adicionar ao contexto da extensão se disponível
        if (this.context) {
            this.context.subscriptions.push(disposable);
        }
    }
}
exports.WebviewManagerService = WebviewManagerService;
//# sourceMappingURL=webview-manager.service.js.map