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
exports.ToolboxUI = void 0;
const vscode = __importStar(require("vscode"));
class ToolboxUI {
    constructor(context) {
        this.context = context;
        this.categoryConfigs = this.initializeCategoryConfigs();
    }
    async createDashboardPanel(toolManager) {
        const panel = vscode.window.createWebviewPanel('fgnToolsDashboard', '🛠️ FGN Tools - Dashboard', vscode.ViewColumn.One, this.getWebviewOptions());
        panel.webview.html = this.getDashboardHTML(toolManager, panel.webview);
        this.setupDashboardMessageHandlers(panel, toolManager);
        return panel;
    }
    async createToolModal(tool, toolManager) {
        const panel = vscode.window.createWebviewPanel(`fgnTool-${tool.id}`, `🛠️ ${tool.name}`, vscode.ViewColumn.Beside, this.getWebviewOptions());
        panel.webview.html = this.getToolHTML(tool, panel.webview);
        this.setupToolMessageHandlers(panel, tool, toolManager);
    }
    getWebviewOptions() {
        return {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out')
            ]
        };
    }
    getDashboardHTML(toolManager, webview) {
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
    getToolHTML(tool, webview) {
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
    groupToolsByCategory(tools) {
        const grouped = new Map();
        tools.forEach(tool => {
            if (!grouped.has(tool.category)) {
                grouped.set(tool.category, []);
            }
            grouped.get(tool.category).push(tool);
        });
        return grouped;
    }
    renderToolsGrid(toolsByCategory) {
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
    renderToolCard(tool) {
        return `
        <div class="tool-card" data-tool-id="${tool.id}">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
        </div>`;
    }
    getDashboardStyles() {
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
    getDashboardScript() {
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
    setupDashboardMessageHandlers(panel, toolManager) {
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'openTool':
                    const tool = toolManager.getTool(message.toolId);
                    if (tool) {
                        await this.createToolModal(tool, toolManager);
                    }
                    else {
                        vscode.window.showErrorMessage(`Ferramenta não encontrada: ${message.toolId}`);
                    }
                    break;
            }
        });
    }
    setupToolMessageHandlers(panel, tool, toolManager) {
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
    initializeCategoryConfigs() {
        const configs = new Map();
        configs.set('code', { icon: '💻', displayName: 'Ferramentas de Código' });
        configs.set('text', { icon: '📝', displayName: 'Ferramentas de Texto' });
        configs.set('file', { icon: '📁', displayName: 'Ferramentas de Arquivo' });
        configs.set('format', { icon: '🎨', displayName: 'Formatadores' });
        configs.set('other', { icon: '🔧', displayName: 'Outras Ferramentas' });
        return configs;
    }
    getCategoryConfig(category) {
        return this.categoryConfigs.get(category) || { icon: '🔧', displayName: category };
    }
}
exports.ToolboxUI = ToolboxUI;
//# sourceMappingURL=toolbox.ui.service.js.map