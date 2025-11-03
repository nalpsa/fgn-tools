import * as vscode from 'vscode';
import { ToolManager } from '../../core/services/tool-manager.service';
import { ITool } from '../../core/interfaces/tool.interface';

interface CategoryConfig {
    icon: string;
    displayName: string;
}

export class ToolboxUI {
    private readonly context: vscode.ExtensionContext;
    private readonly categoryConfigs: Map<string, CategoryConfig>;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.categoryConfigs = this.initializeCategoryConfigs();
    }

    public async createDashboardPanel(toolManager: ToolManager): Promise<vscode.WebviewPanel> {
        const panel = vscode.window.createWebviewPanel(
            'fgnToolsDashboard',
            '🛠️ FGN Tools - Dashboard',
            vscode.ViewColumn.One,
            this.getWebviewOptions()
        );

        panel.webview.html = this.getDashboardHTML(toolManager, panel.webview);
        this.setupDashboardMessageHandlers(panel, toolManager);

        return panel;
    }

    public async createToolModal(tool: ITool, toolManager: ToolManager): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            `fgnTool-${tool.id}`,
            `🛠️ ${tool.name}`,
            vscode.ViewColumn.Beside,
            this.getWebviewOptions()
        );

        panel.webview.html = this.getToolHTML(tool, panel.webview);
        this.setupToolMessageHandlers(panel, tool, toolManager);
    }

    private getWebviewOptions(): vscode.WebviewPanelOptions & vscode.WebviewOptions {
        return {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out')
            ]
        };
    }

    private getDashboardHTML(toolManager: ToolManager, webview: vscode.Webview): string {
        const tools = toolManager.getAllTools();
        const toolsByCategory = this.groupToolsByCategory(tools);

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>🛠️ FGN Tools - Dashboard</title>
            <style>
                ${this.getDashboardStyles()}
            </style>
        </head>
        <body>
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>🛠️ FGN Tools</h1>
                    <p>Caixa de ferramentas de desenvolvimento</p>
                </header>

                <div class="tools-grid">
                    ${this.renderToolsGrid(toolsByCategory)}
                </div>
            </div>

            <script>
                ${this.getDashboardScript()}
            </script>
        </body>
        </html>`;
    }

    private getToolHTML(tool: ITool, webview: vscode.Webview): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${tool.name}</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    margin: 0;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                h1 { 
                    color: var(--vscode-titleBar-activeForeground); 
                    margin-bottom: 10px;
                }
                p {
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 20px;
                }
                #tool-content {
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>${tool.icon} ${tool.name}</h1>
            <p>${tool.description}</p>
            <div id="tool-content">
                <!-- Conteúdo específico da ferramenta -->
                <p>Interface da ferramenta será implementada em breve.</p>
            </div>
        </body>
        </html>`;
    }

    private groupToolsByCategory(tools: ITool[]): Map<string, ITool[]> {
        const grouped = new Map<string, ITool[]>();
        
        tools.forEach(tool => {
            if (!grouped.has(tool.category)) {
                grouped.set(tool.category, []);
            }
            grouped.get(tool.category)!.push(tool);
        });

        return grouped;
    }

    private renderToolsGrid(toolsByCategory: Map<string, ITool[]>): string {
        let html = '';
        
        toolsByCategory.forEach((tools, category) => {
            const categoryConfig = this.getCategoryConfig(category);
            
            html += `
            <div class="category-section">
                <h2 class="category-title">${categoryConfig.icon} ${categoryConfig.displayName}</h2>
                <div class="tools-row">
                    ${tools.map(tool => this.renderToolCard(tool)).join('')}
                </div>
            </div>`;
        });

        return html;
    }

    private renderToolCard(tool: ITool): string {
        return `
        <div class="tool-card" data-tool-id="${tool.id}">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
        </div>`;
    }

    private getDashboardStyles(): string {
        return `
        .dashboard { 
            padding: 20px; 
            max-width: 1200px; 
            margin: 0 auto; 
            font-family: var(--vscode-font-family);
        }
        
        .dashboard-header { 
            text-align: center; 
            margin-bottom: 40px; 
        }
        
        .dashboard-header h1 { 
            color: var(--vscode-titleBar-activeForeground); 
            margin: 0; 
            font-size: 2.5em;
        }
        
        .dashboard-header p { 
            color: var(--vscode-descriptionForeground); 
            margin: 5px 0 0 0; 
            font-size: 1.1em;
        }
        
        .category-section { 
            margin-bottom: 30px; 
        }
        
        .category-title { 
            color: var(--vscode-foreground); 
            border-bottom: 1px solid var(--vscode-input-border);
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .tools-row { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }
        
        .tool-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 80px;
        }
        
        .tool-card:hover {
            background: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .tool-icon { 
            font-size: 24px; 
            margin-bottom: 10px;
        }
        
        .tool-name { 
            color: var(--vscode-foreground); 
            margin: 0 0 5px 0;
            font-size: 14px;
            font-weight: 600;
        }
        
        .tool-description {
            color: var(--vscode-descriptionForeground);
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
        }`;
    }

    private getDashboardScript(): string {
        return `
        const vscode = acquireVsCodeApi();
        
        function initializeEventListeners() {
            document.querySelectorAll('.tool-card').forEach(card => {
                card.addEventListener('click', () => {
                    const toolId = card.getAttribute('data-tool-id');
                    openTool(toolId);
                });
            });
        }
        
        function openTool(toolId) {
            vscode.postMessage({
                command: 'openTool',
                toolId: toolId
            });
        }
        
        window.addEventListener('load', initializeEventListeners);
        
        window.addEventListener('message', (event) => {
            const message = event.data;
            // Handle messages from extension
        });`;
    }

    private setupDashboardMessageHandlers(panel: vscode.WebviewPanel, toolManager: ToolManager): void {
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'openTool':
                    const tool = toolManager.getTool(message.toolId);
                    if (tool) {
                        await this.createToolModal(tool, toolManager);
                    } else {
                        vscode.window.showErrorMessage(`Ferramenta não encontrada: ${message.toolId}`);
                    }
                    break;
            }
        });
    }

    private setupToolMessageHandlers(panel: vscode.WebviewPanel, tool: ITool, toolManager: ToolManager): void {
        // Handlers específicos para cada ferramenta
        // Serão implementados conforme as ferramentas forem criadas
        
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                // Adicionar handlers específicos para cada ferramenta aqui
                default:
                    console.log('Mensagem não tratada:', message);
                    break;
            }
        });
    }

    private initializeCategoryConfigs(): Map<string, CategoryConfig> {
        const configs = new Map<string, CategoryConfig>();
        
        configs.set('code', { icon: '💻', displayName: 'Ferramentas de Código' });
        configs.set('text', { icon: '📝', displayName: 'Ferramentas de Texto' });
        configs.set('file', { icon: '📁', displayName: 'Ferramentas de Arquivo' });
        configs.set('format', { icon: '🎨', displayName: 'Formatadores' });
        configs.set('other', { icon: '🔧', displayName: 'Outras Ferramentas' });
        
        return configs;
    }

    private getCategoryConfig(category: string): CategoryConfig {
        return this.categoryConfigs.get(category) || { icon: '🔧', displayName: category };
    }
}