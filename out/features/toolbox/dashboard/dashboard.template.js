"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardTemplate = void 0;
const tool_interface_1 = require("../../../core/interfaces/tool.interface");
const dashboard_styles_1 = require("./dashboard.styles");
/**
 * Template para geração do HTML do dashboard
 * Seguindo o SRP - apenas responsável por gerar HTML do dashboard
 */
class DashboardTemplate {
    constructor() {
        this.styles = new dashboard_styles_1.DashboardStyles();
    }
    /**
     * Gera o HTML completo do dashboard
     * @param tools Lista de todas as tools
     * @param categories Metadados das categorias
     * @param toolsGrouped Tools agrupadas por categoria
     */
    getHTML(tools, categories, toolsGrouped) {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <title>FGN Tools Dashboard</title>
    <style>
        ${this.styles.getStyles()}
    </style>
</head>
<body>
    <div class="dashboard-container">
        ${this.renderHeader(tools.length)}
        ${this.renderToolsGrid(toolsGrouped, categories)}
    </div>

    <script>
        ${this.getScript()}
    </script>
</body>
</html>`;
    }
    /**
     * Renderiza o cabeçalho do dashboard
     */
    renderHeader(totalTools) {
        return `
        <header class="dashboard-header">
            <div class="header-content">
                <h1 class="dashboard-title">
                    <span class="title-icon">🛠️</span>
                    FGN Tools
                </h1>
                <p class="dashboard-subtitle">Caixa de ferramentas completa para desenvolvimento</p>
                <div class="tools-count">${totalTools} ferramenta${totalTools !== 1 ? 's' : ''} disponível${totalTools !== 1 ? 'eis' : ''}</div>
            </div>
        </header>`;
    }
    /**
     * Renderiza o grid de ferramentas por categoria
     */
    renderToolsGrid(toolsGrouped, categories) {
        const sections = Array.from(toolsGrouped.entries())
            .map(([category, tools]) => {
            const metadata = categories.find(c => c.id === category);
            if (!metadata || tools.length === 0) {
                return '';
            }
            return this.renderCategorySection(metadata, tools);
        })
            .filter(section => section !== '')
            .join('');
        if (!sections) {
            return this.renderEmptyState();
        }
        return `<main class="tools-grid">${sections}</main>`;
    }
    /**
     * Renderiza uma seção de categoria
     */
    renderCategorySection(category, tools) {
        const toolCards = tools.map(tool => this.renderToolCard(tool)).join('');
        return `
        <section class="category-section">
            <div class="category-header">
                <h2 class="category-title">
                    <span class="category-icon">${this.getCategoryEmoji(category.id)}</span>
                    ${category.name}
                </h2>
                <p class="category-description">${category.description}</p>
            </div>
            <div class="tools-row">
                ${toolCards}
            </div>
        </section>`;
    }
    /**
     * Renderiza um card de ferramenta
     */
    renderToolCard(tool) {
        return `
        <div class="tool-card" data-tool-id="${tool.id}" onclick="executeTool('${tool.id}')">
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
            <div class="tool-action">
                <span class="action-arrow">→</span>
            </div>
        </div>`;
    }
    /**
     * Renderiza estado vazio (quando não há tools)
     */
    renderEmptyState() {
        return `
        <div class="empty-state">
            <div class="empty-icon">🔧</div>
            <h2>Nenhuma ferramenta disponível</h2>
            <p>As ferramentas serão carregadas automaticamente quando registradas.</p>
        </div>`;
    }
    /**
     * Obtém o emoji da categoria
     */
    getCategoryEmoji(category) {
        const emojiMap = {
            [tool_interface_1.ToolCategory.CODE]: '💻',
            [tool_interface_1.ToolCategory.TEXT]: '📝',
            [tool_interface_1.ToolCategory.FILE]: '📁',
            [tool_interface_1.ToolCategory.FORMAT]: '🎨',
            [tool_interface_1.ToolCategory.OTHER]: '🔧'
        };
        return emojiMap[category] || '🔧';
    }
    /**
     * Gera o JavaScript do dashboard
     */
    getScript() {
        return `
        (function() {
            'use strict';
            
            const vscode = acquireVsCodeApi();

            /**
             * Executa uma ferramenta
             */
            window.executeTool = function(toolId) {
                console.log('Executando tool:', toolId);
                vscode.postMessage({
                    command: 'executeTool',
                    data: { toolId }
                });
            };

            /**
             * Atualiza o dashboard
             */
            window.refreshDashboard = function() {
                console.log('Atualizando dashboard...');
                vscode.postMessage({
                    command: 'refreshDashboard'
                });
            };

            /**
             * Obtém informações de uma tool
             */
            window.getToolInfo = function(toolId) {
                console.log('Obtendo info da tool:', toolId);
                vscode.postMessage({
                    command: 'getToolInfo',
                    data: { toolId }
                });
            };

            /**
             * Escuta mensagens do backend
             */
            window.addEventListener('message', function(event) {
                const message = event.data;
                
                switch (message.command) {
                    case 'dashboardRefreshed':
                        console.log('Dashboard atualizado:', message.data.timestamp);
                        break;
                        
                    case 'toolInfo':
                        console.log('Info da tool:', message.data);
                        break;
                        
                    case 'error':
                        console.error('Erro:', message.data);
                        break;
                }
            });

            /**
             * Adicionar atalhos de teclado
             */
            document.addEventListener('keydown', function(e) {
                // F5 - Atualizar dashboard
                if (e.key === 'F5') {
                    e.preventDefault();
                    refreshDashboard();
                }
            });

            // Log de inicialização
            console.log('🛠️ FGN Tools Dashboard carregado');
        })();`;
    }
}
exports.DashboardTemplate = DashboardTemplate;
//# sourceMappingURL=dashboard.template.js.map