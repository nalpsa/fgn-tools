import * as vscode from 'vscode';

/**
 * Configuração para criação de webview
 */
export interface WebviewConfig {
    /**
     * ID único do webview
     */
    viewId: string;

    /**
     * Título da janela
     */
    title: string;

    /**
     * Coluna onde abrir o webview
     */
    column?: vscode.ViewColumn;

    /**
     * Opções do webview
     */
    options?: {
        /**
         * Permitir scripts
         */
        enableScripts?: boolean;

        /**
         * Manter contexto quando escondido
         */
        retainContextWhenHidden?: boolean;

        /**
         * Recursos locais permitidos
         */
        localResourceRoots?: vscode.Uri[];
    };
}

/**
 * Mensagem para comunicação com webview
 */
export interface WebviewMessage {
    /**
     * Comando da mensagem
     */
    command: string;

    /**
     * Dados da mensagem
     */
    data?: any;
}

/**
 * Handler para mensagens do webview
 */
export type WebviewMessageHandler = (message: WebviewMessage) => void | Promise<void>;

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
export class WebviewManagerService {
    private static instance: WebviewManagerService;
    private panels: Map<string, vscode.WebviewPanel> = new Map();
    private disposables: Map<string, vscode.Disposable[]> = new Map();
    private context: vscode.ExtensionContext | undefined;

    private constructor() {}

    /**
     * Singleton pattern
     */
    public static getInstance(): WebviewManagerService {
        if (!WebviewManagerService.instance) {
            WebviewManagerService.instance = new WebviewManagerService();
        }
        return WebviewManagerService.instance;
    }

    /**
     * Inicializa o serviço com o contexto da extensão
     */
    public initialize(context: vscode.ExtensionContext): void {
        this.context = context;
    }

    /**
     * Cria ou revela um webview panel
     * @param config Configuração do webview
     * @returns WebviewPanel criado ou existente
     */
    public createOrShowWebview(config: WebviewConfig): vscode.WebviewPanel {
        // Verificar se já existe um panel com este ID
        const existingPanel = this.panels.get(config.viewId);
        if (existingPanel) {
            existingPanel.reveal(config.column || vscode.ViewColumn.Two);
            return existingPanel;
        }

        // Criar novo panel
        const panel = vscode.window.createWebviewPanel(
            config.viewId,
            config.title,
            config.column || vscode.ViewColumn.Two,
            {
                enableScripts: config.options?.enableScripts ?? true,
                retainContextWhenHidden: config.options?.retainContextWhenHidden ?? true,
                localResourceRoots: config.options?.localResourceRoots || []
            }
        );

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
    public getWebview(viewId: string): vscode.WebviewPanel | undefined {
        return this.panels.get(viewId);
    }

    /**
     * Verifica se um webview existe e está ativo
     * @param viewId ID do webview
     */
    public hasWebview(viewId: string): boolean {
        return this.panels.has(viewId);
    }

    /**
     * Define o HTML de um webview
     * @param viewId ID do webview
     * @param html Conteúdo HTML
     */
    public setHtml(viewId: string, html: string): void {
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
    public async sendMessage(viewId: string, message: WebviewMessage): Promise<boolean> {
        const panel = this.panels.get(viewId);
        if (!panel) {
            console.warn(`⚠️  Webview ${viewId} não encontrado para enviar mensagem`);
            return false;
        }

        try {
            await panel.webview.postMessage(message);
            return true;
        } catch (error) {
            console.error(`Erro ao enviar mensagem para ${viewId}:`, error);
            return false;
        }
    }

    /**
     * Registra um handler para mensagens recebidas do webview
     * @param viewId ID do webview
     * @param handler Função para processar mensagens
     */
    public onMessage(viewId: string, handler: WebviewMessageHandler): void {
        const panel = this.panels.get(viewId);
        if (!panel) {
            throw new Error(`Webview ${viewId} não encontrado`);
        }

        const listener = panel.webview.onDidReceiveMessage(
            async (message: WebviewMessage) => {
                try {
                    await handler(message);
                } catch (error) {
                    console.error(`Erro ao processar mensagem do webview ${viewId}:`, error);
                }
            }
        );

        this.addDisposable(viewId, listener);
    }

    /**
     * Dispõe de um webview e seus recursos
     * @param viewId ID do webview
     */
    public disposeWebview(viewId: string): void {
        // Dispor de todos os disposables
        const disposables = this.disposables.get(viewId);
        if (disposables) {
            disposables.forEach(d => {
                try {
                    d.dispose();
                } catch (error) {
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
            } catch (error) {
                console.error(`Erro ao dispor panel ${viewId}:`, error);
            }
            this.panels.delete(viewId);
        }

        console.log(`🗑️  Webview disposed: ${viewId}`);
    }

    /**
     * Dispõe de todos os webviews
     */
    public disposeAll(): void {
        const viewIds = Array.from(this.panels.keys());
        viewIds.forEach(viewId => this.disposeWebview(viewId));
        console.log('🧹 Todos os webviews foram disposed');
    }

    /**
     * Obtém o número de webviews ativos
     */
    public getActiveWebviewCount(): number {
        return this.panels.size;
    }

    /**
     * Revela um webview existente
     * @param viewId ID do webview
     * @param column Coluna onde revelar (opcional)
     */
    public reveal(viewId: string, column?: vscode.ViewColumn): boolean {
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
    public getResourceUri(viewId: string, resourcePath: vscode.Uri): vscode.Uri | undefined {
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
    public setIconPath(viewId: string, iconPath: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri }): void {
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
    private addDisposable(viewId: string, disposable: vscode.Disposable): void {
        const disposables = this.disposables.get(viewId) || [];
        disposables.push(disposable);
        this.disposables.set(viewId, disposables);

        // Adicionar ao contexto da extensão se disponível
        if (this.context) {
            this.context.subscriptions.push(disposable);
        }
    }
}