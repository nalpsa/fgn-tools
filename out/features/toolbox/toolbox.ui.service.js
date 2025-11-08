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
 * ServiÃ§o responsÃ¡vel pela interface visual do dashboard
 */
class ToolboxUIService {
    constructor(context) {
        this.context = context;
        this.toolManager = tool_manager_service_1.ToolManagerService.getInstance();
        this.categoryConfigs = this.initializeCategoryConfigs();
    }
    static getInstance(context) {
        if (!ToolboxUIService.instance && context) {
            ToolboxUIService.instance = new ToolboxUIService(context);
        }
        return ToolboxUIService.instance;
    }
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
            console.log('ðŸ“¦ Dashboard closed');
        });
        console.log('âœ… Dashboard opened');
    }
    async createToolModal(tool) {
        const panel = vscode.window.createWebviewPanel(`fgnTool-${tool.id}`, `🛠️ ${tool.name}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
            // CRITICAL: Adicionar allow-modals para permitir confirm()
            enableFindWidget: true
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
            <title>FGN Tools - Dashboard</title>
            <style>
                ${this.getDashboardStyles()}
            </style>
        </head>
        <body>
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>FGN Tools</h1>
                    <p>Caixa de ferramentas de desenvolvimento</p>
                    <div class="tools-count">${tools.length} ferramentas disponiveis</div>
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
            <title>FGN Tools - Dashboard</title>
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
            <h1>FGN Tools</h1>
            <div class="warning">
                <h2>Nenhuma ferramenta encontrada</h2>
                <p>As ferramentas nao foram registradas corretamente.</p>
                <p>Verifique o console do VS Code para mais detalhes.</p>
            </div>
        </body>
        </html>`;
    }
    getToolHTML(tool, webview) {
        if (tool.id === 'remove-all-empty-lines') {
            return this.getRemoveAllEmptyLinesHTML(tool, webview);
        }
        if (tool.id === 'ajustar-linhas') {
            return this.getAjustarLinhasHTML(tool, webview);
        }
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
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; script-src 'unsafe-inline';">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vscode/codicons@latest/dist/codicon.css">
    <title>${tool.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body { 
            font-family: var(--vscode-font-family);
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        h1 { 
            color: var(--vscode-titleBar-activeForeground); 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        p {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
        }
        .warning-box {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .warning-icon {
            font-size: 20px;
            flex-shrink: 0;
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
            padding: 8px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }
        button:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            background: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
            opacity: 0.6;
        }
        .secondary-button {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .secondary-button:hover:not(:disabled) {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .danger-button {
            background: var(--vscode-inputValidation-errorBackground);
        }
        .danger-button:hover:not(:disabled) {
            background: var(--vscode-inputValidation-errorBorder);
        }
        .file-explorer {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            min-height: 400px;
            max-height: 600px;
            overflow-y: auto;
            display: block;
        }
        .file-item {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-bottom: 1px solid var(--vscode-input-border);
            cursor: pointer;
            transition: background 0.15s;
        }
        .file-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-checkbox {
            margin-right: 10px;
            cursor: pointer;
        }
        .expand-icon {
            margin-right: 5px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .file-icon {
            margin-right: 8px;
            width: 16px;
            text-align: center;
            color: var(--vscode-symbolIcon-fileForeground);
        }
        .folder-icon {
            color: var(--vscode-symbolIcon-folderForeground);
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
        .folder-children {
            margin-left: 30px;
        }
        .folder-children.collapsed {
            display: none;
        }
        .results {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            display: none;
        }
        .results.show {
            display: block;
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
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid var(--vscode-progressBar-background);
            border-top-color: var(--vscode-textLink-foreground);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .empty-message {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .empty-icon {
            font-size: 48px;
            opacity: 0.5;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <h1>
        <i class="codicon codicon-trash"></i>
        ${tool.name}
    </h1>
    <p>${tool.description}</p>
    
    <div class="warning-box">
        <i class="codicon codicon-warning warning-icon"></i>
        <div>
            <strong>Atencao:</strong> Esta ferramenta removera TODAS as linhas vazias dos arquivos selecionados.
            Esta acao nao pode ser desfeita. Recomendamos fazer backup dos arquivos antes de prosseguir.
        </div>
    </div>

    <div class="action-buttons">
        <button id="selectAllBtn" class="secondary-button">
            <i class="codicon codicon-check-all"></i>
            Selecionar Tudo
        </button>
        <button id="deselectAllBtn" class="secondary-button">
            <i class="codicon codicon-close-all"></i>
            Desmarcar Tudo
        </button>
        <button id="expandAllBtn" class="secondary-button">
            <i class="codicon codicon-expand-all"></i>
            Expandir Tudo
        </button>
        <button id="collapseAllBtn" class="secondary-button">
            <i class="codicon codicon-collapse-all"></i>
            Colapsar Tudo
        </button>
        <button id="refreshBtn" class="secondary-button">
            <i class="codicon codicon-refresh"></i>
            Atualizar Lista
        </button>
        <button id="executeBtn" class="danger-button" disabled>
            <i class="codicon codicon-trash"></i>
            Executar Remocao
        </button>
    </div>

    <div class="file-explorer" id="fileExplorer">
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Carregando estrutura de arquivos...</p>
        </div>
    </div>

    <div id="results" class="results">
        <div id="resultContent"></div>
    </div>

    <script>
        (function() {
            'use strict';
            
            const vscode = acquireVsCodeApi();
            
            const fileExplorer = document.getElementById('fileExplorer');
            const selectAllBtn = document.getElementById('selectAllBtn');
            const deselectAllBtn = document.getElementById('deselectAllBtn');
            const expandAllBtn = document.getElementById('expandAllBtn');
            const collapseAllBtn = document.getElementById('collapseAllBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const executeBtn = document.getElementById('executeBtn');
            const resultsDiv = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');

            let filesData = [];

            window.addEventListener('load', function() {
                console.log('Webview carregada, solicitando arquivos...');
                loadWorkspaceFiles();
            });

            selectAllBtn.addEventListener('click', function() {
                selectAll(true);
            });

            deselectAllBtn.addEventListener('click', function() {
                selectAll(false);
            });

            expandAllBtn.addEventListener('click', function() {
                expandAll(true);
            });

            collapseAllBtn.addEventListener('click', function() {
                expandAll(false);
            });

            refreshBtn.addEventListener('click', function() {
                loadWorkspaceFiles();
            });

            executeBtn.addEventListener('click', function() {
                executeRemoval();
            });

            function selectAll(checked) {
                const checkboxes = document.querySelectorAll('.file-checkbox');
                checkboxes.forEach(cb => cb.checked = checked);
                updateExecuteButton();
            }

            function expandAll(expand) {
                const folders = document.querySelectorAll('.folder-children');
                const icons = document.querySelectorAll('.expand-icon');
                
                folders.forEach(folder => {
                    if (expand) {
                        folder.classList.remove('collapsed');
                    } else {
                        folder.classList.add('collapsed');
                    }
                });

                icons.forEach(icon => {
                    icon.innerHTML = expand 
                        ? '<i class="codicon codicon-chevron-down"></i>'
                        : '<i class="codicon codicon-chevron-right"></i>';
                });
            }

            function executeRemoval() {
                const selectedFiles = getSelectedFiles();

                if (selectedFiles.length === 0) {
                    showResult('<i class="codicon codicon-error"></i> Por favor, selecione pelo menos um arquivo ou pasta.', 'error');
                    return;
                }

                // Usar vscode.window.showWarningMessage ao invÃ©s de confirm()
                vscode.postMessage({
                    command: 'confirmExecution',
                    data: {
                        selections: selectedFiles,
                        workspacePath: '.'
                    }
                });
            }

            function getSelectedFiles() {
                const checkboxes = document.querySelectorAll('.file-checkbox:checked');
                const files = [];
                
                checkboxes.forEach(checkbox => {
                    files.push({
                        name: checkbox.dataset.name,
                        path: checkbox.dataset.path,
                        type: checkbox.dataset.type,
                        selected: true
                    });
                });
                
                return files;
            }

            function updateExecuteButton() {
                const selectedCount = document.querySelectorAll('.file-checkbox:checked').length;
                executeBtn.disabled = selectedCount === 0;
            }

            function loadWorkspaceFiles() {
                fileExplorer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Carregando estrutura de arquivos...</p></div>';
                executeBtn.disabled = true;
                
                vscode.postMessage({
                    command: 'getWorkspaceFiles'
                });
            }

            function showResult(message, type) {
                resultsDiv.className = 'results show ' + (type || 'success');
                resultContent.innerHTML = message;
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            function renderFileExplorer(files) {
                console.log('===== RENDER FILE EXPLORER =====');
                console.log('Renderizando', files ? files.length : 0, 'arquivos');
                console.log('fileExplorer element:', fileExplorer);
                filesData = files;
                
                if (!files || files.length === 0) {
                    console.log('Nenhum arquivo - mostrando mensagem vazia');
                    fileExplorer.innerHTML = 
                        '<div class="empty-message">' +
                        '<div class="empty-icon"><i class="codicon codicon-folder-opened"></i></div>' +
                        '<p>Nenhum arquivo encontrado no workspace.</p>' +
                        '<p style="font-size: 12px; margin-top: 10px;">Abra uma pasta no VS Code e tente novamente.</p>' +
                        '</div>';
                    return;
                }

                console.log('Construindo Ã¡rvore...');
                // Organizar em estrutura de Ã¡rvore
                const tree = buildTree(files);
                console.log('Ãrvore construÃ­da:', tree);
                
                console.log('Renderizando Ã¡rvore...');
                const treeHTML = renderTree(tree);
                console.log('HTML gerado, length:', treeHTML.length);
                
                fileExplorer.innerHTML = treeHTML;
                console.log('innerHTML definido, children count:', fileExplorer.children.length);

                // Adicionar event listeners
                setupEventListeners();
                updateExecuteButton();
                console.log('===== FIM RENDER =====');
            }

            function buildTree(files) {
                console.log('buildTree: recebidos', files.length, 'arquivos');
                console.log('Exemplo de arquivo:', files[0]);
                
                const tree = { children: [] };
                const folderMap = {};

                // Primeiro: identificar todas as pastas Ãºnicas
                files.forEach(file => {
                    if (file.type === 'folder') {
                        if (!folderMap[file.path]) {
                            folderMap[file.path] = {
                                ...file,
                                children: [],
                                expanded: false
                            };
                        }
                    }
                });

                console.log('Pastas identificadas:', Object.keys(folderMap).length);

                // Segundo: organizar pastas em hierarquia
                Object.values(folderMap).forEach(folder => {
                    const parts = folder.path.split('/');
                    
                    if (parts.length === 1 || folder.path === '.') {
                        // Pasta raiz
                        tree.children.push(folder);
                    } else {
                        // Subpasta - encontrar pai
                        const parentPath = parts.slice(0, -1).join('/');
                        const parent = folderMap[parentPath];
                        
                        if (parent) {
                            parent.children.push(folder);
                        } else {
                            // Se nÃ£o encontrou pai, adiciona na raiz
                            tree.children.push(folder);
                        }
                    }
                });

                // Terceiro: adicionar arquivos Ã s suas pastas
                files.forEach(file => {
                    if (file.type === 'file') {
                        const parts = file.path.split('/');
                        
                        if (parts.length === 1) {
                            // Arquivo na raiz
                            tree.children.push(file);
                        } else {
                            // Arquivo em subpasta
                            const parentPath = parts.slice(0, -1).join('/');
                            const parent = folderMap[parentPath];
                            
                            if (parent) {
                                parent.children.push(file);
                            } else {
                                // Se nÃ£o encontrou pasta pai, adiciona na raiz
                                tree.children.push(file);
                            }
                        }
                    }
                });

                console.log('Ãrvore final - children na raiz:', tree.children.length);
                return tree;
            }

            function renderTree(node, level = 0) {
                console.log('renderTree: level=', level, 'children=', node.children ? node.children.length : 0);
                let html = '';
                
                if (node.children && node.children.length > 0) {
                    node.children.forEach((child, index) => {
                        console.log('  [' + index + '] Renderizando:', child.type, child.name);
                        if (child.type === 'folder') {
                            html += renderFolder(child, level);
                        } else if (child.type === 'file') {
                            html += renderFile(child, level);
                        } else {
                            console.warn('  Tipo desconhecido:', child.type);
                        }
                    });
                } else {
                    console.log('renderTree: SEM CHILDREN para renderizar!');
                }

                return html;
            }

            function renderFolder(folder, level) {
                const indent = level * 20;
                const hasChildren = folder.children && folder.children.length > 0;
                const expandIcon = hasChildren 
                    ? '<span class="expand-icon" data-path="' + escapeHtml(folder.path) + '"><i class="codicon codicon-chevron-right"></i></span>'
                    : '<span style="width: 16px; display: inline-block;"></span>';

                let html = 
                    '<div class="file-item" style="padding-left: ' + indent + 'px">' +
                    expandIcon +
                    '<input type="checkbox" class="file-checkbox folder-checkbox" ' +
                    'data-name="' + escapeHtml(folder.name) + '" ' +
                    'data-path="' + escapeHtml(folder.path) + '" ' +
                    'data-type="folder" ' +
                    (folder.selected ? 'checked' : '') + '>' +
                    '<i class="codicon codicon-folder file-icon folder-icon"></i>' +
                    '<div class="file-info">' +
                    '<div class="file-name">' + escapeHtml(folder.name) + '</div>' +
                    '<div class="file-path">' + escapeHtml(folder.path) + '</div>' +
                    '</div>' +
                    '</div>';

                if (hasChildren) {
                    html += '<div class="folder-children collapsed" data-parent="' + escapeHtml(folder.path) + '">';
                    html += renderTree(folder, level + 1);
                    html += '</div>';
                }

                return html;
            }

            function renderFile(file, level) {
                const indent = level * 20;
                return '<div class="file-item" style="padding-left: ' + indent + 'px">' +
                    '<span style="width: 16px; display: inline-block; margin-right: 5px;"></span>' +
                    '<input type="checkbox" class="file-checkbox" ' +
                    'data-name="' + escapeHtml(file.name) + '" ' +
                    'data-path="' + escapeHtml(file.path) + '" ' +
                    'data-type="file" ' +
                    (file.selected ? 'checked' : '') + '>' +
                    '<i class="codicon codicon-file file-icon"></i>' +
                    '<div class="file-info">' +
                    '<div class="file-name">' + escapeHtml(file.name) + '</div>' +
                    '<div class="file-path">' + escapeHtml(file.path) + '</div>' +
                    '</div>' +
                    '</div>';
            }

            function setupEventListeners() {
                // Expand/collapse folders
                document.querySelectorAll('.expand-icon').forEach(icon => {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const path = this.dataset.path;
                        const children = document.querySelector('.folder-children[data-parent="' + path + '"]');
                        const iconEl = this.querySelector('i');
                        
                        if (children) {
                            children.classList.toggle('collapsed');
                            iconEl.className = children.classList.contains('collapsed')
                                ? 'codicon codicon-chevron-right'
                                : 'codicon codicon-chevron-down';
                        }
                    });
                });

                // Folder checkbox: select/deselect all children
                document.querySelectorAll('.folder-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const path = this.dataset.path;
                        const children = document.querySelector('.folder-children[data-parent="' + path + '"]');
                        
                        if (children) {
                            const childCheckboxes = children.querySelectorAll('.file-checkbox');
                            childCheckboxes.forEach(cb => {
                                cb.checked = this.checked;
                            });
                        }
                        
                        updateExecuteButton();
                    });
                });

                // File checkbox
                document.querySelectorAll('.file-checkbox:not(.folder-checkbox)').forEach(checkbox => {
                    checkbox.addEventListener('change', updateExecuteButton);
                });
            }

            function escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            window.addEventListener('message', function(event) {
                const message = event.data;
                console.log('Mensagem recebida:', message.command);
                
                if (message.command === 'workspaceFiles') {
                    renderFileExplorer(message.files);
                } else if (message.command === 'executionStarted') {
                    executeBtn.disabled = true;
                    executeBtn.innerHTML = '<i class="codicon codicon-loading codicon-modifier-spin"></i> Processando...';
                } else if (message.command === 'executionResult') {
                    executeBtn.disabled = false;
                    executeBtn.innerHTML = '<i class="codicon codicon-trash"></i> Executar Remocao';
                    
                    if (message.result.success) {
                        const stats = message.result.stats || {};
                        let resultHTML = '<p><i class="codicon codicon-check"></i> <strong>Remocao concluida com sucesso!</strong></p>';
                        
                        if (stats.filesProcessed > 0 || stats.linesChanged > 0) {
                            resultHTML += '<p style="margin-top: 10px;">';
                            if (stats.filesProcessed > 0) {
                                resultHTML += '<i class="codicon codicon-file"></i> <strong>' + stats.filesProcessed + '</strong> arquivo(s) processado(s)';
                            }
                            if (stats.filesProcessed > 0 && stats.linesChanged > 0) {
                                resultHTML += ' &bull; ';
                            }
                            if (stats.linesChanged > 0) {
                                resultHTML += '<i class="codicon codicon-trash"></i> <strong>' + stats.linesChanged + '</strong> linha(s) removida(s)';
                            }
                            resultHTML += '</p>';
                        }
                        
                        showResult(resultHTML, 'success');
                    } else {
                        showResult(
                            '<p><i class="codicon codicon-error"></i> <strong>Erro durante a execucao:</strong></p>' +
                            '<p style="margin-top: 10px;">' + escapeHtml(message.result.error || 'Erro desconhecido') + '</p>',
                            'error'
                        );
                    }
                }
            });
        })();
    </script>
</body>
</html>`;
    }
    getAjustarLinhasHTML(tool, webview) {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; script-src 'unsafe-inline';">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vscode/codicons@latest/dist/codicon.css">
    <title>${tool.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body { 
            font-family: var(--vscode-font-family);
            padding: 20px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        h1 { 
            color: var(--vscode-titleBar-activeForeground); 
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        p {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
        }
        .warning-box {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .warning-icon {
            font-size: 20px;
            flex-shrink: 0;
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
            padding: 8px 14px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }
        button:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
        }
        button:disabled {
            background: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
            opacity: 0.6;
        }
        .secondary-button {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .secondary-button:hover:not(:disabled) {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .danger-button {
            background: var(--vscode-inputValidation-errorBackground);
        }
        .danger-button:hover:not(:disabled) {
            background: var(--vscode-inputValidation-errorBorder);
        }
        .file-explorer {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            min-height: 400px;
            max-height: 600px;
            overflow-y: auto;
            display: block;
        }
        .file-item {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-bottom: 1px solid var(--vscode-input-border);
            cursor: pointer;
            transition: background 0.15s;
        }
        .file-item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-checkbox {
            margin-right: 10px;
            cursor: pointer;
        }
        .expand-icon {
            margin-right: 5px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .file-icon {
            margin-right: 8px;
            width: 16px;
            text-align: center;
            color: var(--vscode-symbolIcon-fileForeground);
        }
        .folder-icon {
            color: var(--vscode-symbolIcon-folderForeground);
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
        .folder-children {
            margin-left: 30px;
        }
        .folder-children.collapsed {
            display: none;
        }
        .results {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            display: none;
        }
        .results.show {
            display: block;
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
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .loading-spinner {
            width: 30px;
            height: 30px;
            border: 3px solid var(--vscode-progressBar-background);
            border-top-color: var(--vscode-textLink-foreground);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 15px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .empty-message {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .empty-icon {
            font-size: 48px;
            opacity: 0.5;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <h1>
        <i class="codicon codicon-wand"></i>
        ${tool.name}
    </h1>
    <p>${tool.description}</p>
    
    <div class="warning-box">
        <i class="codicon codicon-warning warning-icon"></i>
        <div>
            <strong>Atencao:</strong> Esta ferramenta removera TODAS as linhas vazias dos arquivos selecionados.
            Esta acao nao pode ser desfeita. Recomendamos fazer backup dos arquivos antes de prosseguir.
        </div>
    </div>

    <div class="action-buttons">
        <button id="selectAllBtn" class="secondary-button">
            <i class="codicon codicon-check-all"></i>
            Selecionar Tudo
        </button>
        <button id="deselectAllBtn" class="secondary-button">
            <i class="codicon codicon-close-all"></i>
            Desmarcar Tudo
        </button>
        <button id="expandAllBtn" class="secondary-button">
            <i class="codicon codicon-expand-all"></i>
            Expandir Tudo
        </button>
        <button id="collapseAllBtn" class="secondary-button">
            <i class="codicon codicon-collapse-all"></i>
            Colapsar Tudo
        </button>
        <button id="refreshBtn" class="secondary-button">
            <i class="codicon codicon-refresh"></i>
            Atualizar Lista
        </button>
        <button id="executeBtn" class="danger-button" disabled>
            <i class="codicon codicon-wand"></i>
            Executar Remocao
        </button>
    </div>

    <div class="file-explorer" id="fileExplorer">
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Carregando estrutura de arquivos...</p>
        </div>
    </div>

    <div id="results" class="results">
        <div id="resultContent"></div>
    </div>

    <script>
        (function() {
            'use strict';
            
            const vscode = acquireVsCodeApi();
            
            const fileExplorer = document.getElementById('fileExplorer');
            const selectAllBtn = document.getElementById('selectAllBtn');
            const deselectAllBtn = document.getElementById('deselectAllBtn');
            const expandAllBtn = document.getElementById('expandAllBtn');
            const collapseAllBtn = document.getElementById('collapseAllBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const executeBtn = document.getElementById('executeBtn');
            const resultsDiv = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');

            let filesData = [];

            window.addEventListener('load', function() {
                console.log('Webview carregada, solicitando arquivos...');
                loadWorkspaceFiles();
            });

            selectAllBtn.addEventListener('click', function() {
                selectAll(true);
            });

            deselectAllBtn.addEventListener('click', function() {
                selectAll(false);
            });

            expandAllBtn.addEventListener('click', function() {
                expandAll(true);
            });

            collapseAllBtn.addEventListener('click', function() {
                expandAll(false);
            });

            refreshBtn.addEventListener('click', function() {
                loadWorkspaceFiles();
            });

            executeBtn.addEventListener('click', function() {
                executeRemoval();
            });

            function selectAll(checked) {
                const checkboxes = document.querySelectorAll('.file-checkbox');
                checkboxes.forEach(cb => cb.checked = checked);
                updateExecuteButton();
            }

            function expandAll(expand) {
                const folders = document.querySelectorAll('.folder-children');
                const icons = document.querySelectorAll('.expand-icon');
                
                folders.forEach(folder => {
                    if (expand) {
                        folder.classList.remove('collapsed');
                    } else {
                        folder.classList.add('collapsed');
                    }
                });

                icons.forEach(icon => {
                    icon.innerHTML = expand 
                        ? '<i class="codicon codicon-chevron-down"></i>'
                        : '<i class="codicon codicon-chevron-right"></i>';
                });
            }

            function executeRemoval() {
                const selectedFiles = getSelectedFiles();

                if (selectedFiles.length === 0) {
                    showResult('<i class="codicon codicon-error"></i> Por favor, selecione pelo menos um arquivo ou pasta.', 'error');
                    return;
                }

                // Usar vscode.window.showWarningMessage ao invÃ©s de confirm()
                vscode.postMessage({
                    command: 'confirmExecution',
                    data: {
                        selections: selectedFiles,
                        workspacePath: '.'
                    }
                });
            }

            function getSelectedFiles() {
                const checkboxes = document.querySelectorAll('.file-checkbox:checked');
                const files = [];
                
                checkboxes.forEach(checkbox => {
                    files.push({
                        name: checkbox.dataset.name,
                        path: checkbox.dataset.path,
                        type: checkbox.dataset.type,
                        selected: true
                    });
                });
                
                return files;
            }

            function updateExecuteButton() {
                const selectedCount = document.querySelectorAll('.file-checkbox:checked').length;
                executeBtn.disabled = selectedCount === 0;
            }

            function loadWorkspaceFiles() {
                fileExplorer.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Carregando estrutura de arquivos...</p></div>';
                executeBtn.disabled = true;
                
                vscode.postMessage({
                    command: 'getWorkspaceFiles'
                });
            }

            function showResult(message, type) {
                resultsDiv.className = 'results show ' + (type || 'success');
                resultContent.innerHTML = message;
                resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            function renderFileExplorer(files) {
                console.log('===== RENDER FILE EXPLORER =====');
                console.log('Renderizando', files ? files.length : 0, 'arquivos');
                console.log('fileExplorer element:', fileExplorer);
                filesData = files;
                
                if (!files || files.length === 0) {
                    console.log('Nenhum arquivo - mostrando mensagem vazia');
                    fileExplorer.innerHTML = 
                        '<div class="empty-message">' +
                        '<div class="empty-icon"><i class="codicon codicon-folder-opened"></i></div>' +
                        '<p>Nenhum arquivo encontrado no workspace.</p>' +
                        '<p style="font-size: 12px; margin-top: 10px;">Abra uma pasta no VS Code e tente novamente.</p>' +
                        '</div>';
                    return;
                }

                console.log('Construindo Ã¡rvore...');
                // Organizar em estrutura de Ã¡rvore
                const tree = buildTree(files);
                console.log('Ãrvore construÃ­da:', tree);
                
                console.log('Renderizando Ã¡rvore...');
                const treeHTML = renderTree(tree);
                console.log('HTML gerado, length:', treeHTML.length);
                
                fileExplorer.innerHTML = treeHTML;
                console.log('innerHTML definido, children count:', fileExplorer.children.length);

                // Adicionar event listeners
                setupEventListeners();
                updateExecuteButton();
                console.log('===== FIM RENDER =====');
            }

            function buildTree(files) {
                console.log('buildTree: recebidos', files.length, 'arquivos');
                console.log('Exemplo de arquivo:', files[0]);
                
                const tree = { children: [] };
                const folderMap = {};

                // Primeiro: identificar todas as pastas Ãºnicas
                files.forEach(file => {
                    if (file.type === 'folder') {
                        if (!folderMap[file.path]) {
                            folderMap[file.path] = {
                                ...file,
                                children: [],
                                expanded: false
                            };
                        }
                    }
                });

                console.log('Pastas identificadas:', Object.keys(folderMap).length);

                // Segundo: organizar pastas em hierarquia
                Object.values(folderMap).forEach(folder => {
                    const parts = folder.path.split('/');
                    
                    if (parts.length === 1 || folder.path === '.') {
                        // Pasta raiz
                        tree.children.push(folder);
                    } else {
                        // Subpasta - encontrar pai
                        const parentPath = parts.slice(0, -1).join('/');
                        const parent = folderMap[parentPath];
                        
                        if (parent) {
                            parent.children.push(folder);
                        } else {
                            // Se nÃ£o encontrou pai, adiciona na raiz
                            tree.children.push(folder);
                        }
                    }
                });

                // Terceiro: adicionar arquivos Ã s suas pastas
                files.forEach(file => {
                    if (file.type === 'file') {
                        const parts = file.path.split('/');
                        
                        if (parts.length === 1) {
                            // Arquivo na raiz
                            tree.children.push(file);
                        } else {
                            // Arquivo em subpasta
                            const parentPath = parts.slice(0, -1).join('/');
                            const parent = folderMap[parentPath];
                            
                            if (parent) {
                                parent.children.push(file);
                            } else {
                                // Se nÃ£o encontrou pasta pai, adiciona na raiz
                                tree.children.push(file);
                            }
                        }
                    }
                });

                console.log('Ãrvore final - children na raiz:', tree.children.length);
                return tree;
            }

            function renderTree(node, level = 0) {
                console.log('renderTree: level=', level, 'children=', node.children ? node.children.length : 0);
                let html = '';
                
                if (node.children && node.children.length > 0) {
                    node.children.forEach((child, index) => {
                        console.log('  [' + index + '] Renderizando:', child.type, child.name);
                        if (child.type === 'folder') {
                            html += renderFolder(child, level);
                        } else if (child.type === 'file') {
                            html += renderFile(child, level);
                        } else {
                            console.warn('  Tipo desconhecido:', child.type);
                        }
                    });
                } else {
                    console.log('renderTree: SEM CHILDREN para renderizar!');
                }

                return html;
            }

            function renderFolder(folder, level) {
                const indent = level * 20;
                const hasChildren = folder.children && folder.children.length > 0;
                const expandIcon = hasChildren 
                    ? '<span class="expand-icon" data-path="' + escapeHtml(folder.path) + '"><i class="codicon codicon-chevron-right"></i></span>'
                    : '<span style="width: 16px; display: inline-block;"></span>';

                let html = 
                    '<div class="file-item" style="padding-left: ' + indent + 'px">' +
                    expandIcon +
                    '<input type="checkbox" class="file-checkbox folder-checkbox" ' +
                    'data-name="' + escapeHtml(folder.name) + '" ' +
                    'data-path="' + escapeHtml(folder.path) + '" ' +
                    'data-type="folder" ' +
                    (folder.selected ? 'checked' : '') + '>' +
                    '<i class="codicon codicon-folder file-icon folder-icon"></i>' +
                    '<div class="file-info">' +
                    '<div class="file-name">' + escapeHtml(folder.name) + '</div>' +
                    '<div class="file-path">' + escapeHtml(folder.path) + '</div>' +
                    '</div>' +
                    '</div>';

                if (hasChildren) {
                    html += '<div class="folder-children collapsed" data-parent="' + escapeHtml(folder.path) + '">';
                    html += renderTree(folder, level + 1);
                    html += '</div>';
                }

                return html;
            }

            function renderFile(file, level) {
                const indent = level * 20;
                return '<div class="file-item" style="padding-left: ' + indent + 'px">' +
                    '<span style="width: 16px; display: inline-block; margin-right: 5px;"></span>' +
                    '<input type="checkbox" class="file-checkbox" ' +
                    'data-name="' + escapeHtml(file.name) + '" ' +
                    'data-path="' + escapeHtml(file.path) + '" ' +
                    'data-type="file" ' +
                    (file.selected ? 'checked' : '') + '>' +
                    '<i class="codicon codicon-file file-icon"></i>' +
                    '<div class="file-info">' +
                    '<div class="file-name">' + escapeHtml(file.name) + '</div>' +
                    '<div class="file-path">' + escapeHtml(file.path) + '</div>' +
                    '</div>' +
                    '</div>';
            }

            function setupEventListeners() {
                // Expand/collapse folders
                document.querySelectorAll('.expand-icon').forEach(icon => {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const path = this.dataset.path;
                        const children = document.querySelector('.folder-children[data-parent="' + path + '"]');
                        const iconEl = this.querySelector('i');
                        
                        if (children) {
                            children.classList.toggle('collapsed');
                            iconEl.className = children.classList.contains('collapsed')
                                ? 'codicon codicon-chevron-right'
                                : 'codicon codicon-chevron-down';
                        }
                    });
                });

                // Folder checkbox: select/deselect all children
                document.querySelectorAll('.folder-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        const path = this.dataset.path;
                        const children = document.querySelector('.folder-children[data-parent="' + path + '"]');
                        
                        if (children) {
                            const childCheckboxes = children.querySelectorAll('.file-checkbox');
                            childCheckboxes.forEach(cb => {
                                cb.checked = this.checked;
                            });
                        }
                        
                        updateExecuteButton();
                    });
                });

                // File checkbox
                document.querySelectorAll('.file-checkbox:not(.folder-checkbox)').forEach(checkbox => {
                    checkbox.addEventListener('change', updateExecuteButton);
                });
            }

            function escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            window.addEventListener('message', function(event) {
                const message = event.data;
                console.log('Mensagem recebida:', message.command);
                
                if (message.command === 'workspaceFiles') {
                    renderFileExplorer(message.files);
                } else if (message.command === 'executionStarted') {
                    executeBtn.disabled = true;
                    executeBtn.innerHTML = '<i class="codicon codicon-loading codicon-modifier-spin"></i> Processando...';
                } else if (message.command === 'executionResult') {
                    executeBtn.disabled = false;
                    executeBtn.innerHTML = '<i class="codicon codicon-wand"></i> Executar Remocao';
                    
                    if (message.result.success) {
                        const stats = message.result.stats || {};
                        let resultHTML = '<p><i class="codicon codicon-check"></i> <strong>Remocao concluida com sucesso!</strong></p>';
                        
                        if (stats.filesProcessed > 0 || stats.linesChanged > 0) {
                            resultHTML += '<p style="margin-top: 10px;">';
                            if (stats.filesProcessed > 0) {
                                resultHTML += '<i class="codicon codicon-file"></i> <strong>' + stats.filesProcessed + '</strong> arquivo(s) processado(s)';
                            }
                            if (stats.filesProcessed > 0 && stats.linesChanged > 0) {
                                resultHTML += ' &bull; ';
                            }
                            if (stats.linesChanged > 0) {
                                resultHTML += '<i class="codicon codicon-wand"></i> <strong>' + stats.linesChanged + '</strong> linha(s) ajustada(s)';
                            }
                            resultHTML += '</p>';
                        }
                        
                        showResult(resultHTML, 'success');
                    } else {
                        showResult(
                            '<p><i class="codicon codicon-error"></i> <strong>Erro durante a execucao:</strong></p>' +
                            '<p style="margin-top: 10px;">' + escapeHtml(message.result.error || 'Erro desconhecido') + '</p>',
                            'error'
                        );
                    }
                }
            });
        })();
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
                ${tool.icon}
            </div>
            <div class="tool-info">
                <h3 class="tool-name">${tool.name}</h3>
                <p class="tool-description">${tool.description}</p>
            </div>
            <div class="tool-action">
                &rarr;
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
                        vscode.window.showErrorMessage(`Ferramenta nÃ£o encontrada: ${message.toolId}`);
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
            console.log(`📨 Mensagem recebida do webview: ${message.command}`);
            switch (message.command) {
                case 'getWorkspaceFiles':
                    const files = await this.getWorkspaceFiles();
                    panel.webview.postMessage({
                        command: 'workspaceFiles',
                        files: files
                    });
                    break;
                case 'confirmExecution':
                    console.log('⚠️ Confirmando execução...');
                    // Mensagem de confirmação baseada na tool
                    let confirmMessage = '';
                    if (tool.id === 'remove-all-empty-lines') {
                        confirmMessage = 'ATENÇÃO: Esta ação removerá TODAS as linhas vazias dos arquivos selecionados e não pode ser desfeita.\n\nDeseja continuar?';
                    }
                    else if (tool.id === 'ajustar-linhas') {
                        confirmMessage = 'ATENÇÃO: Esta ação ajustará as linhas vazias dos arquivos selecionados, mantendo apenas 1 linha entre blocos.\n\nEsta ação não pode ser desfeita. Deseja continuar?';
                    }
                    else {
                        confirmMessage = `ATENÇÃO: Esta ação modificará os arquivos selecionados e não pode ser desfeita.\n\nDeseja continuar?`;
                    }
                    // Mostrar diálogo de confirmação usando API do VS Code
                    const confirmed = await vscode.window.showWarningMessage(confirmMessage, { modal: true }, 'Sim, executar');
                    if (confirmed === 'Sim, executar') {
                        console.log('✅ Usuário confirmou, iniciando execução...');
                        panel.webview.postMessage({
                            command: 'executionStarted'
                        });
                        try {
                            const workspaceFolders = vscode.workspace.workspaceFolders;
                            if (!workspaceFolders || workspaceFolders.length === 0) {
                                console.error('❌ Nenhum workspace aberto');
                                panel.webview.postMessage({
                                    command: 'executionResult',
                                    result: {
                                        success: false,
                                        error: 'Nenhum workspace aberto. Por favor, abra uma pasta no VS Code primeiro.'
                                    }
                                });
                                return;
                            }
                            const workspacePath = workspaceFolders[0].uri.fsPath;
                            console.log(`📁 Workspace path: ${workspacePath}`);
                            console.log(`📄 Seleções recebidas: ${message.data.selections.length}`);
                            // CRITICAL: Chamar o método executeTool da TOOL, não processar aqui
                            const inputData = {
                                selections: message.data.selections,
                                workspacePath: workspacePath
                            };
                            console.log('🎯 Chamando tool.execute() diretamente...');
                            // Chamar diretamente o método execute da tool
                            const result = await tool.executeTool(inputData);
                            console.log('✅ Tool executada, resultado:', result);
                            panel.webview.postMessage({
                                command: 'executionResult',
                                result: result
                            });
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : String(error);
                            console.error('❌ Erro na execução:', errorMessage);
                            panel.webview.postMessage({
                                command: 'executionResult',
                                result: {
                                    success: false,
                                    error: errorMessage
                                }
                            });
                        }
                    }
                    else {
                        console.log('❌ Usuário cancelou a execução');
                    }
                    break;
                case 'execute':
                    // Fallback para compatibilidade
                    console.log('📤 Comando execute recebido (fallback)');
                    try {
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
                        const workspacePath = workspaceFolders[0].uri.fsPath;
                        const inputData = {
                            selections: message.data.selections,
                            workspacePath: workspacePath
                        };
                        // Chamar diretamente o método executeTool da tool
                        const result = await tool.executeTool(inputData);
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
            console.log('âŒ Nenhum workspace aberto');
            return [];
        }
        const files = [];
        try {
            for (const folder of workspaceFolders) {
                files.push({
                    name: folder.name,
                    path: '.',
                    type: 'folder',
                    selected: true
                });
                const folderFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**,**/.git/**,**/out/**,**/dist/**,**/build/**,**/.vscode/**');
                console.log(`ðŸ“ Encontrados ${folderFiles.length} arquivos no workspace: ${folder.name}`);
                const fileStructure = this.organizeFilesByStructure(folderFiles, folder.uri.fsPath);
                files.push(...fileStructure);
            }
            console.log(`âœ… Total de ${files.length} itens na estrutura`);
        }
        catch (error) {
            console.error('âŒ Erro ao carregar arquivos do workspace:', error);
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
                console.error(`âŒ Erro ao processar arquivo ${file.fsPath}:`, error);
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
        configs.set('code', { icon: '', displayName: 'Ferramentas de Codigo' });
        configs.set('text', { icon: '', displayName: 'Ferramentas de Texto' });
        configs.set('file', { icon: '', displayName: 'Ferramentas de Arquivo' });
        configs.set('format', { icon: '', displayName: 'Formatadores' });
        configs.set('other', { icon: '', displayName: 'Outras Ferramentas' });
        return configs;
    }
    getCategoryConfig(category) {
        return this.categoryConfigs.get(category) || { icon: '', displayName: category };
    }
}
exports.ToolboxUIService = ToolboxUIService;
//# sourceMappingURL=toolbox.ui.service.js.map