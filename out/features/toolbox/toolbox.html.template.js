"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolboxHtmlTemplate = getToolboxHtmlTemplate;
/**
 * Gera o HTML do dashboard com design moderno e responsivo
 */
function getToolboxHtmlTemplate(categories, toolsGrouped) {
    const categorySections = Array.from(toolsGrouped.entries())
        .map(([category, tools]) => {
        const metadata = categories.find(c => c.id === category);
        if (!metadata || tools.length === 0)
            return '';
        const toolCards = tools.map(tool => `
                <div class="tool-card" onclick="executeTool('${tool.id}')">
                    <div class="tool-icon">
                        <i class="codicon codicon-${tool.icon}"></i>
                    </div>
                    <div class="tool-content">
                        <h4 class="tool-title">${tool.name}</h4>
                        <p class="tool-description">${tool.description}</p>
                    </div>
                    <div class="tool-action">
                        <i class="codicon codicon-chevron-right"></i>
                    </div>
                </div>
            `).join('');
        return `
                <section class="category-section">
                    <div class="category-header">
                        <div class="category-title">
                            <i class="codicon codicon-${metadata.icon}"></i>
                            <h3>${metadata.name}</h3>
                        </div>
                        <p class="category-description">${metadata.description}</p>
                    </div>
                    <div class="tools-grid">
                        ${toolCards}
                    </div>
                </section>
            `;
    })
        .join('');
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <title>FGN Tools Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 0;
            margin: 0;
            overflow-x: hidden;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .dashboard-header {
            text-align: center;
            padding: 40px 20px;
            background: var(--vscode-sideBar-background);
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }

        .dashboard-header p {
            font-size: 1.1rem;
            color: var(--vscode-descriptionForeground);
            margin-top: 10px;
        }

        /* Category Section */
        .category-section {
            margin-bottom: 50px;
            animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .category-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--vscode-widget-border);
        }

        .category-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }

        .category-title i {
            font-size: 1.8rem;
            color: var(--vscode-textLink-foreground);
        }

        .category-title h3 {
            font-size: 1.5rem;
            font-weight: 600;
        }

        .category-description {
            color: var(--vscode-descriptionForeground);
            font-size: 0.95rem;
            margin-left: 42px;
        }

        /* Tools Grid */
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        /* Tool Card */
        .tool-card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: flex-start;
            gap: 15px;
            position: relative;
            overflow: hidden;
        }

        .tool-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--vscode-textLink-foreground);
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }

        .tool-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            border-color: var(--vscode-textLink-foreground);
        }

        .tool-card:hover::before {
            transform: scaleY(1);
        }

        .tool-icon {
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vscode-button-background);
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .tool-card:hover .tool-icon {
            background: var(--vscode-button-hoverBackground);
            transform: scale(1.1);
        }

        .tool-icon i {
            font-size: 24px;
            color: var(--vscode-button-foreground);
        }

        .tool-content {
            flex: 1;
        }

        .tool-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 6px;
            color: var(--vscode-foreground);
        }

        .tool-description {
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            line-height: 1.4;
        }

        .tool-action {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            opacity: 0.5;
            transition: all 0.3s ease;
        }

        .tool-card:hover .tool-action {
            opacity: 1;
            transform: translateX(4px);
        }

        .tool-action i {
            font-size: 20px;
            color: var(--vscode-textLink-foreground);
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state i {
            font-size: 4rem;
            margin-bottom: 20px;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .tools-grid {
                grid-template-columns: 1fr;
            }

            .dashboard-header h1 {
                font-size: 2rem;
            }
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: var(--vscode-editor-background);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }

        /* Loading Animation */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--vscode-widget-border);
            border-top-color: var(--vscode-textLink-foreground);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h1>🛠️ FGN Tools</h1>
            <p>Sua caixa de ferramentas completa para desenvolvimento</p>
        </header>

        <main id="toolsContent">
            ${categorySections || `
                <div class="empty-state">
                    <i class="codicon codicon-tools"></i>
                    <h3>Nenhuma ferramenta disponível</h3>
                    <p>As ferramentas serão carregadas em breve...</p>
                </div>
            `}
        </main>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        /**
         * Executa uma ferramenta
         */
        function executeTool(toolId) {
            console.log('Executing tool:', toolId);
            vscode.postMessage({
                command: 'executeTool',
                toolId: toolId
            });
        }

        /**
         * Solicita dados do dashboard
         */
        function requestDashboardData() {
            vscode.postMessage({
                command: 'getDashboardData'
            });
        }

        /**
         * Atualiza o dashboard
         */
        function refreshDashboard() {
            vscode.postMessage({
                command: 'refreshDashboard'
            });
        }

        // Escuta mensagens do backend
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'dashboardData':
                    console.log('Dashboard data received:', message.data);
                    // Aqui você pode atualizar dinamicamente se necessário
                    break;
                    
                case 'toolExecuted':
                    console.log('Tool executed successfully');
                    break;
                    
                case 'error':
                    console.error('Error:', message.message);
                    break;
            }
        });

        // Inicialização
        console.log('FGN Tools Dashboard loaded');
    </script>
</body>
</html>`;
}
//# sourceMappingURL=toolbox.html.template.js.map