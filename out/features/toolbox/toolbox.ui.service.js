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
/**
 * Serviço responsável pela interface visual do dashboard
 */
class ToolboxUIService {
    constructor(context) {
        this.context = context;
        this.toolManager = tool_manager_service_1.ToolManagerService.getInstance();
        this.categoryConfigs = this.initializeCategoryConfigs();
    }
    /**
     * Singleton pattern para garantir única instância
     */
    static getInstance(context) {
        if (!ToolboxUIService.instance && context) {
            ToolboxUIService.instance = new ToolboxUIService(context);
        }
        return ToolboxUIService.instance;
    }
    /**
     * Abre o dashboard de ferramentas
     */
    async openDashboard() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.panel = vscode.window.createWebviewPanel('fgnToolsDashboard', '🛠️ FGN Tools - Dashboard', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out')
            ]
        });
        this.panel.webview.html = this.getDashboardHTML();
        this.setupDashboardMessageHandlers();
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            console.log('📦 Dashboard closed');
        });
        console.log('✅ Dashboard opened');
    }
    /**
     * Cria um modal para uma ferramenta específica
     */
    async createToolModal(tool) {
        const panel = vscode.window.createWebviewPanel(`fgnTool-${tool.id}`, `🛠️ ${tool.name}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getToolHTML(tool, panel.webview);
        this.setupToolMessageHandlers(panel, tool);
    }
    getDashboardHTML() {
        const tools = this.toolManager.getAllTools();
        if (tools.length === 0) {
            return this.getNoToolsHTML();
        }
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
                    <div class="tools-count">${tools.length} ferramentas disponíveis</div>
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
    getNoToolsHTML() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>🛠️ FGN Tools - Dashboard</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family);
                    padding: 40px;
                    text-align: center;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                }
                h1 { color: var(--vscode-titleBar-activeForeground); }
                .warning { 
                    background: var(--vscode-inputValidation-warningBackground);
                    border: 1px solid var(--vscode-inputValidation-warningBorder);
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <h1>🛠️ FGN Tools</h1>
            <div class="warning">
                <h2>Nenhuma ferramenta encontrada</h2>
                <p>As ferramentas não foram registradas corretamente.</p>
                <p>Verifique o console do VS Code para mais detalhes.</p>
            </div>
        </body>
        </html>`;
    }
    getToolHTML(tool, webview) {
        if (tool.id === 'remove-all-empty-lines') {
            return this.getRemoveAllEmptyLinesHTML(tool, webview);
        }
        // HTML padrão para outras ferramentas
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${tool.name}</title>
            <style>
                ${this.getToolStyles()}
            </style>
        </head>
        <body>
            <h1>${tool.icon} ${tool.name}</h1>
            <p>${tool.description}</p>
            <div class="tool-content">
                <div class="placeholder">
                    Interface da ferramenta em desenvolvimento
                </div>
            </div>
        </body>
        </html>`;
    }
    getRemoveAllEmptyLinesHTML(tool, webview) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${tool.name}</title>
            <style>
                ${this.getToolStyles()}
                .warning-box {
                    background: var(--vscode-inputValidation-warningBackground);
                    border: 1px solid var(--vscode-inputValidation-warningBorder);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .file-explorer {
                    background: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .file-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 5px;
                    border-bottom: 1px solid var(--vscode-input-border);
                    cursor: pointer;
                }
                .file-item:hover {
                    background: var(--vscode-list-hoverBackground);
                }
                .file-item:last-child {
                    border-bottom: none;
                }
                .file-checkbox {
                    margin-right: 10px;
                }
                .file-icon {
                    margin-right: 8px;
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                }
                .file-info {
                    flex: 1;
                }
                .file-name {
                    color: var(--vscode-foreground);
                    font-weight: 500;
                    font-size: 13px;
                }
                .file-path {
                    color: var(--vscode-descriptionForeground);
                    font-size: 11px;
                    margin-top: 2px;
                }
                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin: 20px 0;
                    flex-wrap: wrap;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background 0.2s;
                }
                button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                button:disabled {
                    background: var(--vscode-button-secondaryBackground);
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                .danger-button {
                    background: var(--vscode-inputValidation-errorBackground);
                    color: var(--vscode-inputValidation-errorForeground);
                }
                .danger-button:hover {
                    background: var(--vscode-inputValidation-errorBorder);
                }
                .results {
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    display: none;
                }
                .success {
                    background: var(--vscode-inputValidation-infoBackground);
                    border: 1px solid var(--vscode-inputValidation-infoBorder);
                }
                .error {
                    background: var(--vscode-inputValidation-errorBackground);
                    border: 1px solid var(--vscode-inputValidation-errorBorder);
                }
                .loading {
                    text-align: center;
                    padding: 20px;
                    color: var(--vscode-descriptionForeground);
                }
                .folder-children {
                    margin-left: 20px;
                    border-left: 1px solid var(--vscode-input-border);
                    padding-left: 10px;
                }
                .empty-message {
                    text-align: center;
                    padding: 20px;
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <h1>${tool.icon} ${tool.name}</h1>
            <p>${tool.description}</p>
            
            <div class="tool-content">
                <div class="warning-box">
                    <strong>⚠️ Atenção:</strong> Esta ferramenta removerá TODAS as linhas vazias dos arquivos selecionados.
                    Esta ação não pode ser desfeita. Recomendamos fazer backup dos arquivos antes de prosseguir.
                </div>

                <div class="file-explorer" id="fileExplorer">
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>Carregando estrutura de arquivos...</p>
                    </div>
                </div>

                <div class="action-buttons">
                    <button id="selectAllBtn">✅ Selecionar Tudo</button>
                    <button id="deselectAllBtn">❌ Desmarcar Tudo</button>
                    <button id="refreshBtn">🔄 Atualizar Lista</button>
                    <button id="executeBtn" class="danger-button">🧹 Executar Remoção</button>
                </div>

                <div id="results" class="results">
                    <h3>Resultado da Execução:</h3>
                    <div id="resultContent"></div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                // Elementos da UI
                const fileExplorer = document.getElementById('fileExplorer');
                const selectAllBtn = document.getElementById('selectAllBtn');
                const deselectAllBtn = document.getElementById('deselectAllBtn');
                const refreshBtn = document.getElementById('refreshBtn');
                const executeBtn = document.getElementById('executeBtn');
                const resultsDiv = document.getElementById('results');
                const resultContent = document.getElementById('resultContent');

                let currentFiles = [];

                // Solicitar lista de arquivos ao carregar
                window.addEventListener('load', () => {
                    loadWorkspaceFiles();
                });

                // Botões de ação
                selectAllBtn.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('.file-checkbox');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = true;
                    });
                    updateExecuteButton();
                });

                deselectAllBtn.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('.file-checkbox');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });
                    updateExecuteButton();
                });

                refreshBtn.addEventListener('click', () => {
                    loadWorkspaceFiles();
                });

                // Executar a ferramenta
                executeBtn.addEventListener('click', async () => {
                    const selectedFiles = getSelectedFiles();
                    
                    if (selectedFiles.length === 0) {
                        showResult('Por favor, selecione pelo menos um arquivo ou pasta.', 'error');
                        return;
                    }

                    // Confirmação adicional
                    const userConfirmed = confirm('⚠️ ATENÇÃO: Esta ação removerá TODAS as linhas vazias dos arquivos selecionados e não pode ser desfeita.\\n\\nDeseja continuar?');
                    if (!userConfirmed) {
                        return;
                    }

                    executeBtn.disabled = true;
                    executeBtn.textContent = '⏳ Removendo linhas vazias...';

                    vscode.postMessage({
                        command: 'execute',
                        data: {
                            selections: selectedFiles,
                            workspacePath: '.' // Será preenchido pela extensão
                        }
                    });
                });

                // Obter arquivos selecionados
                function getSelectedFiles() {
                    const selectedFiles = [];
                    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
                    
                    checkboxes.forEach(checkbox => {
                        selectedFiles.push({
                            name: checkbox.dataset.name,
                            path: checkbox.dataset.path,
                            type: checkbox.dataset.type,
                            selected: true
                        });
                    });
                    
                    return selectedFiles;
                }

                // Atualizar estado do botão executar
                function updateExecuteButton() {
                    const selectedFiles = getSelectedFiles();
                    executeBtn.disabled = selectedFiles.length === 0;
                }

                // Carregar arquivos do workspace
                function loadWorkspaceFiles() {
                    fileExplorer.innerHTML = '<div class="loading"><p>Carregando estrutura de arquivos...</p></div>';
                    vscode.postMessage({
                        command: 'getWorkspaceFiles'
                    });
                }

                // Mostrar resultados
                function showResult(message, type = 'success') {
                    resultsDiv.style.display = 'block';
                    resultsDiv.className = 'results ' + type;
                    resultContent.innerHTML = message;
                    
                    // Scroll para resultados
                    resultsDiv.scrollIntoView({ behavior: 'smooth' });
                }

                // Renderizar explorador de arquivos
                function renderFileExplorer(files) {
                    currentFiles = files;
                    
                    if (!files || files.length === 0) {
                        fileExplorer.innerHTML = '
                            <div class="empty-message">
                                <p>📁 Nenhum arquivo encontrado no workspace.</p>
                                <p>Para usar esta ferramenta:</p>
                                <ol>
                                    <li>Abra uma pasta no VS Code (File → Open Folder)</li>
                                    <li>Certifique-se de que a pasta contém arquivos de texto (.js, .ts, .html, etc.)</li>
                                    <li>Clique em "🔄 Atualizar Lista"</li>
                                </ol>
                                <button onclick="loadWorkspaceFiles()" style="margin-top: 10px;">🔄 Tentar Novamente</button>
                        </div>';
                        return;
                    }

                    let html = '<div class="file-structure">';
                    
                    // Agrupar arquivos por pasta
                    const folders = {};
                    files.forEach(file => {
                        if (file.type === 'folder') {
                            folders[file.path] = {
                                ...file,
                                children: []
                            };
                        }
                    });

                    // Adicionar arquivos às pastas
                    files.forEach(file => {
                        if (file.type === 'file') {
                            const folderPath = file.path.includes('/') 
                                ? file.path.substring(0, file.path.lastIndexOf('/'))
                                : '.';
                            
                            if (folders[folderPath]) {
                                folders[folderPath].children.push(file);
                            } else {
                                // Se não encontrou a pasta, criar uma entrada para a pasta raiz
                                if (!folders['.']) {
                                    folders['.'] = {
                                        name: 'Workspace',
                                        path: '.',
                                        type: 'folder',
                                        selected: true,
                                        children: []
                                    };
                                }
                                folders['.'].children.push(file);
                            }
                        }
                    });

                    // Renderizar estrutura
                    Object.values(folders).forEach(folder => {
                        html += renderFolder(folder);
                    });

                    html += '</div>';
                    fileExplorer.innerHTML = html;

                    // Adicionar event listeners aos checkboxes
                    const checkboxes = document.querySelectorAll('.file-checkbox');
                    checkboxes.forEach(checkbox => {
                        checkbox.addEventListener('change', updateExecuteButton);
                    });

                    updateExecuteButton();
                }

                // Renderizar pasta e seus filhos
                function renderFolder(folder, level = 0) {
                    let html = \`
                    <div class="file-item" style="margin-left: \${level * 15}px">
                        <input type="checkbox" class="file-checkbox" 
                            data-name="\${folder.name}" 
                            data-path="\${folder.path}" 
                            data-type="\${folder.type}" 
                            \${folder.selected ? 'checked' : ''}>
                        <span class="file-icon">📁</span>
                        <div class="file-info">
                            <div class="file-name">\${folder.name}</div>
                            <div class="file-path">\${folder.path}</div>
                        </div>
                    </div>\`;

                    if (folder.children && folder.children.length > 0) {
                        html += '<div class="folder-children">';
                        folder.children.forEach(child => {
                            html += \`
                            <div class="file-item" style="margin-left: \${(level + 1) * 15}px">
                                <input type="checkbox" class="file-checkbox" 
                                    data-name="\${child.name}" 
                                    data-path="\${child.path}" 
                                    data-type="\${child.type}" 
                                    \${child.selected ? 'checked' : ''}>
                                <span class="file-icon">📄</span>
                                <div class="file-info">
                                    <div class="file-name">\${child.name}</div>
                                    <div class="file-path">\${child.path}</div>
                                </div>
                            </div>\`;
                        });
                        html += '</div>';
                    }

                    return html;
                }

                // Ouvir mensagens da extensão
                window.addEventListener('message', (event) => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'workspaceFiles':
                            renderFileExplorer(message.files);
                            break;
                        
                        case 'executionResult':
                            executeBtn.disabled = false;
                            executeBtn.textContent = '🧹 Executar Remoção';
                            
                            if (message.result.success) {
                                const stats = message.result.stats || {};
                                const filesText = stats.filesProcessed > 0 ? 
                                    '<strong>' + stats.filesProcessed + '</strong> arquivo(s) processado(s)' : '';
                                const linesText = stats.linesChanged > 0 ? 
                                    '<strong>' + stats.linesChanged + '</strong> linha(s) removida(s)' : '';
                                
                                showResult(
                                    '<p>✅ Remoção concluída com sucesso!</p>' +
                                    '<p>' + filesText + (filesText && linesText ? ' - ' : '') + linesText + '</p>',
                                    'success'
                                );
                            } else {
                                showResult(
                                    '<p>❌ Erro durante a execução:</p>' +
                                    '<p>' + (message.result.error || 'Erro desconhecido') + '</p>',
                                    'error'
                                );
                            }
                            break;
                    }
                });

                // Adicionar estilo para loading spinner
                const style = document.createElement('style');
                style.textContent = \`
                    .loading-spinner {
                        width: 20px;
                        height: 20px;
                        border: 2px solid var(--vscode-widget-border);
                        border-top: 2px solid var(--vscode-textLink-foreground);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 10px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                \`;
                document.head.appendChild(style);
            </script>
        </body>
        </html>`;
    }
    getToolStyles() {
        return `
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
        .tool-content {
            margin-top: 20px;
        }
        .placeholder {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }`;
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
            <div class="tool-icon">
                ${tool.icon} <!-- Emoji direto -->
            </div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
            <div class="tool-action">
                ➡️ <!-- Emoji seta -->
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
            border-bottom: 1px solid var(--vscode-input-border);
            padding-bottom: 30px;
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
        
        .tools-count {
            margin-top: 10px;
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
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
            display: flex;
            align-items: center;
            gap: 10px;
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
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 15px;
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
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: var(--vscode-button-background);
            border-radius: 8px;
            color: var(--vscode-button-foreground);
            font-size: 28px;
        }
        
        .tool-info {
            flex: 1;
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
        }
        
        .tool-action {
            opacity: 0.5;
            transition: opacity 0.2s ease;
            font-size: 18px;
        }
        
        .tool-card:hover .tool-action {
            opacity: 1;
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
            console.log('Message from extension:', message);
        });`;
    }
    setupDashboardMessageHandlers() {
        if (!this.panel)
            return;
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'openTool':
                    const tool = this.toolManager.getTool(message.toolId);
                    if (tool) {
                        await this.createToolModal(tool);
                    }
                    else {
                        vscode.window.showErrorMessage(`Ferramenta não encontrada: ${message.toolId}`);
                    }
                    break;
                case 'getWorkspaceFiles':
                    const files = await this.getWorkspaceFiles();
                    this.panel?.webview.postMessage({
                        command: 'workspaceFiles',
                        files: files
                    });
                    break;
            }
        });
    }
    setupToolMessageHandlers(panel, tool) {
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'getWorkspaceFiles':
                    const files = await this.getWorkspaceFiles();
                    panel.webview.postMessage({
                        command: 'workspaceFiles',
                        files: files
                    });
                    break;
                case 'execute':
                    try {
                        // Verificar se há workspace aberto
                        const workspaceFolders = vscode.workspace.workspaceFolders;
                        if (!workspaceFolders || workspaceFolders.length === 0) {
                            panel.webview.postMessage({
                                command: 'executionResult',
                                result: {
                                    success: false,
                                    error: 'Nenhum workspace aberto. Por favor, abra uma pasta no VS Code primeiro.'
                                }
                            });
                            return;
                        }
                        // Adicionar workspace path
                        message.data.workspacePath = workspaceFolders[0].uri.fsPath;
                        const result = await this.toolManager.executeTool(tool.id, message.data);
                        panel.webview.postMessage({
                            command: 'executionResult',
                            result: result
                        });
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        panel.webview.postMessage({
                            command: 'executionResult',
                            result: {
                                success: false,
                                error: errorMessage
                            }
                        });
                    }
                    break;
            }
        });
    }
    async getWorkspaceFiles() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('❌ Nenhum workspace aberto');
            return [];
        }
        const files = [];
        try {
            for (const folder of workspaceFolders) {
                // Primeiro adiciona a pasta raiz
                files.push({
                    name: folder.name,
                    path: '.',
                    type: 'folder',
                    selected: true
                });
                // Buscar arquivos recursivamente
                const folderFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**,**/.git/**,**/out/**,**/dist/**,**/build/**,**/.vscode/**');
                console.log(`📁 Encontrados ${folderFiles.length} arquivos no workspace: ${folder.name}`);
                // Organizar por pastas e arquivos
                const fileStructure = this.organizeFilesByStructure(folderFiles, folder.uri.fsPath);
                files.push(...fileStructure);
            }
            console.log(`✅ Total de ${files.length} itens na estrutura`);
        }
        catch (error) {
            console.error('❌ Erro ao carregar arquivos do workspace:', error);
        }
        return files;
    }
    organizeFilesByStructure(files, basePath) {
        const structure = [];
        const addedPaths = new Set();
        files.forEach(file => {
            try {
                const relativePath = vscode.workspace.asRelativePath(file);
                const pathParts = relativePath.split('/');
                // Adicionar pastas intermediárias
                let currentPath = '';
                for (let i = 0; i < pathParts.length - 1; i++) {
                    currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
                    if (!addedPaths.has(currentPath)) {
                        structure.push({
                            name: pathParts[i],
                            path: currentPath,
                            type: 'folder',
                            selected: true
                        });
                        addedPaths.add(currentPath);
                    }
                }
                // Adicionar arquivo
                const fileName = pathParts[pathParts.length - 1];
                if (this.isArquivoTexto(fileName)) {
                    structure.push({
                        name: fileName,
                        path: relativePath,
                        type: 'file',
                        selected: true
                    });
                }
            }
            catch (error) {
                console.error(`❌ Erro ao processar arquivo ${file.fsPath}:`, error);
            }
        });
        return structure;
    }
    isArquivoTexto(nome) {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        return extensoes.some(ext => nome.toLowerCase().endsWith(ext));
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
exports.ToolboxUIService = ToolboxUIService;
//# sourceMappingURL=toolbox.ui.service.js.map