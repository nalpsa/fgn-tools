import { ITool, ICategoryMetadata, ToolCategory } from '../../../core/interfaces/tool.interface';
import { DashboardStyles } from './dashboard.styles';

/**
 * Template para geração do HTML do dashboard
 * Seguindo o SRP - apenas responsável por gerar HTML do dashboard
 */
export class DashboardTemplate {
    private styles: DashboardStyles;

    constructor() {
        this.styles = new DashboardStyles();
    }

    /**
     * Gera o HTML completo do dashboard
     * @param tools Lista de todas as tools
     * @param categories Metadados das categorias
     * @param toolsGrouped Tools agrupadas por categoria
     */
    public getHTML(
        tools: ITool[],
        categories: ICategoryMetadata[],
        toolsGrouped: Map<ToolCategory, ITool[]>
    ): string {
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
    private renderHeader(totalTools: number): string {
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
    private renderToolsGrid(
        toolsGrouped: Map<ToolCategory, ITool[]>,
        categories: ICategoryMetadata[]
    ): string {
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
    private renderCategorySection(category: ICategoryMetadata, tools: ITool[]): string {
        const toolCards = tools.map(tool => this.renderToolCard(tool)).join('');

        return `
        <section class="category-section">
            <div class="category-header">
                <h2 class="category-title">
                    <span class="category-icon">${this.getCategoryEmoji(category.id)}</span>
                    ${this.getCategoryDisplayName(category.id)}
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
    private renderToolCard(tool: ITool): string {
        const iconHTML = this.getToolIconHTML(tool.icon);
        
        return `
        <div class="tool-card" data-tool-id="${tool.id}" onclick="executeTool('${tool.id}')">
            <div class="tool-icon-container">
                ${iconHTML}
            </div>
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
     * Obtém o HTML do ícone da ferramenta
     */
    private getToolIconHTML(icon: string): string {
        // Se o ícone já é HTML (como um emoji), retorna direto
        if (icon.includes('<') || icon.match(/[\u{1F300}-\u{1F9FF}]/u)) {
            return `<span class="tool-icon">${icon}</span>`;
        }
        
        // Se é um nome de ícone do Codicon
        return `<i class="codicon codicon-${icon} tool-icon"></i>`;
    }

    /**
     * Renderiza estado vazio (quando não há tools)
     */
    private renderEmptyState(): string {
        return `
        <div class="empty-state">
            <div class="empty-icon">🔧</div>
            <h2>Nenhuma ferramenta disponível</h2>
            <p>As ferramentas serão carregadas automaticamente quando registradas.</p>
        </div>`;
    }

    /**
     * Obtém o nome de exibição da categoria
     */
    private getCategoryDisplayName(category: ToolCategory): string {
        const names: Record<ToolCategory, string> = {
            [ToolCategory.FILE]: 'Ferramentas de Arquivo',
            [ToolCategory.TEXT]: 'Ferramentas de Texto',
            [ToolCategory.CODE]: 'Ferramentas de Código',
            [ToolCategory.FORMAT]: 'Formatadores',
            [ToolCategory.OTHER]: 'Outras Ferramentas'
        };
        return names[category] || 'Ferramentas';
    }

    /**
     * Obtém o emoji da categoria
     */
    private getCategoryEmoji(category: ToolCategory): string {
        const emojiMap: Record<ToolCategory, string> = {
            [ToolCategory.FILE]: '📂',
            [ToolCategory.TEXT]: '📝',
            [ToolCategory.CODE]: '💻',
            [ToolCategory.FORMAT]: '🎨',
            [ToolCategory.OTHER]: '🔧'
        };
        return emojiMap[category] || '🔧';
    }

    /**
     * Gera o JavaScript do dashboard
     */
    private getScript(): string {
        return `
        (function() {
            'use strict';
            
            const vscode = acquireVsCodeApi();

            /**
             * Executa uma ferramenta
             */
            window.executeTool = function(toolId) {
                console.log('Executando tool:', toolId);
                
                // Feedback visual
                const card = document.querySelector(\`[data-tool-id="\${toolId}"]\`);
                if (card) {
                    card.classList.add('executing');
                    setTimeout(() => card.classList.remove('executing'), 300);
                }
                
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
                        console.log('✅ Dashboard atualizado:', message.data?.timestamp);
                        // Recarregar página se necessário
                        if (message.data?.reload) {
                            location.reload();
                        }
                        break;
                        
                    case 'toolInfo':
                        console.log('ℹ️  Info da tool:', message.data);
                        break;
                        
                    case 'toolExecuted':
                        console.log('✅ Tool executada:', message.data);
                        break;
                        
                    case 'error':
                        console.error('❌ Erro:', message.data);
                        break;
                        
                    default:
                        console.log('📨 Mensagem recebida:', message.command);
                }
            });

            /**
             * Adicionar efeitos hover nos cards
             */
            document.querySelectorAll('.tool-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-4px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
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
                
                // Ctrl/Cmd + K - Pesquisar ferramentas (futuro)
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    console.log('Pesquisa de ferramentas (em desenvolvimento)');
                }
            });

            /**
             * Adicionar animação de entrada
             */
            function animateCardsOnLoad() {
                const cards = document.querySelectorAll('.tool-card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50);
                });
            }

            /**
             * Contar ferramentas por categoria
             */
            function logStatistics() {
                const categories = document.querySelectorAll('.category-section');
                console.log('📊 Estatísticas do Dashboard:');
                
                categories.forEach(section => {
                    const categoryName = section.querySelector('.category-title')?.textContent?.trim();
                    const toolCount = section.querySelectorAll('.tool-card').length;
                    console.log(\`   \${categoryName}: \${toolCount} ferramenta(s)\`);
                });
            }

            // Inicialização
            window.addEventListener('load', function() {
                console.log('🛠️ FGN Tools Dashboard carregado');
                animateCardsOnLoad();
                logStatistics();
            });
        })();`;
    }
}