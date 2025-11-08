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
exports.AjustarLinhasTool = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para ajustar linhas vazias em arquivos
 * Mantém apenas 1 linha vazia entre blocos de código, removendo linhas excedentes
 */
class AjustarLinhasTool {
    constructor() {
        this.id = 'ajustar-linhas';
        this.name = 'Ajustar Linhas Vazias';
        this.description = 'Remove linhas vazias excedentes mantendo apenas 1 linha entre blocos';
        this.icon = '🪄';
        this.category = tool_interface_1.ToolCategory.FILE;
    }
    async execute(input) {
        try {
            // Sempre abre a UI para seleção interativa
            this.openUI();
            return {
                success: true,
                output: 'UI aberta para seleção de arquivos'
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ Erro no AjustarLinhasTool:', errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    openUI() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel('ajustarLinhas', '🪄 Ajustar Linhas Vazias', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageListener();
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    setupMessageListener() {
        if (!this.panel)
            return;
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'getWorkspaceFiles':
                    const files = await this.getWorkspaceFiles();
                    this.panel?.webview.postMessage({
                        command: 'workspaceFiles',
                        files: files
                    });
                    break;
                case 'execute':
                    const result = await this.executeTool(message.data);
                    this.panel?.webview.postMessage({
                        command: 'executionResult',
                        result: result
                    });
                    break;
            }
        });
    }
    async executeTool(input) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return {
                success: false,
                error: 'Nenhum workspace aberto'
            };
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        console.log(`🔧 AjustarLinhasTool executando...`);
        console.log(`📂 Workspace: ${workspacePath}`);
        console.log(`📄 Seleções: ${input.selections.length}`);
        try {
            let totalArquivos = 0;
            let totalLinhasRemovidas = 0;
            for (const selection of input.selections) {
                if (selection.selected) {
                    console.log(`📋 Processando: ${selection.name} (${selection.type}) - ${selection.path}`);
                    const fullPath = path.join(workspacePath, selection.path);
                    console.log(`📂 Caminho completo: ${fullPath}`);
                    if (selection.type === 'folder') {
                        const resultado = await this.processarPasta(fullPath);
                        totalArquivos += resultado.arquivos;
                        totalLinhasRemovidas += resultado.linhas;
                        console.log(`📊 Pasta processada: ${resultado.arquivos} arquivos, ${resultado.linhas} linhas removidas`);
                    }
                    else {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            totalArquivos++;
                            totalLinhasRemovidas += resultado.linhasRemovidas;
                            console.log(`📊 Arquivo processado: ${resultado.linhasRemovidas} linhas removidas`);
                        }
                    }
                }
            }
            console.log(`✅ Processamento concluído: ${totalArquivos} arquivos, ${totalLinhasRemovidas} linhas removidas`);
            return {
                success: true,
                stats: {
                    filesProcessed: totalArquivos,
                    linesChanged: totalLinhasRemovidas
                }
            };
        }
        catch (error) {
            console.error(`❌ Erro no AjustarLinhasTool:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Erro ao processar: ${errorMessage}`
            };
        }
    }
    async getWorkspaceFiles() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('❌ Nenhum workspace aberto');
            return [];
        }
        const files = [];
        try {
            const workspaceFolder = workspaceFolders[0];
            console.log(`📁 Workspace: ${workspaceFolder.name} (${workspaceFolder.uri.fsPath})`);
            // Usar findFiles para buscar arquivos
            const allFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**,**/.git/**,**/out/**,**/dist/**,**/build/**,**/.vscode/**');
            console.log(`📄 Total de arquivos encontrados: ${allFiles.length}`);
            // Adicionar pasta raiz
            files.push({
                name: workspaceFolder.name,
                path: '.',
                type: 'folder',
                selected: true
            });
            // Processar arquivos encontrados
            for (const file of allFiles) {
                try {
                    const relativePath = vscode.workspace.asRelativePath(file);
                    const fileName = path.basename(file.fsPath);
                    // Verificar se é um arquivo de texto
                    if (this.isArquivoTexto(fileName)) {
                        files.push({
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
            }
            console.log(`✅ Arquivos de texto encontrados: ${files.length - 1}`); // -1 para a pasta raiz
        }
        catch (error) {
            console.error('❌ Erro ao carregar arquivos do workspace:', error);
        }
        return files;
    }
    async processarPasta(pastaPath) {
        console.log(`📁 Processando pasta: ${pastaPath}`);
        let arquivos = 0;
        let linhas = 0;
        const processarRecursivo = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                console.log(`📂 Conteúdo de ${dir}: ${entries.length} entradas`);
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        console.log(`📁 Subpasta: ${entry.name}`);
                        await processarRecursivo(fullPath);
                    }
                    else if (this.isArquivoTexto(entry.name)) {
                        console.log(`📄 Arquivo texto: ${entry.name}`);
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            arquivos++;
                            linhas += resultado.linhasRemovidas;
                        }
                    }
                    else {
                        console.log(`⏭️ Ignorando: ${entry.name} (não é arquivo texto)`);
                    }
                }
            }
            catch (error) {
                console.error(`❌ Erro ao processar pasta ${dir}:`, error);
            }
        };
        await processarRecursivo(pastaPath);
        return { arquivos, linhas };
    }
    async processarArquivo(filePath) {
        try {
            console.log(`📄 Processando arquivo: ${filePath}`);
            // Verificar se o arquivo existe
            if (!fs.existsSync(filePath)) {
                console.error(`❌ Arquivo não existe: ${filePath}`);
                return null;
            }
            const stats = await fs.promises.stat(filePath);
            console.log(`📊 Tamanho do arquivo: ${stats.size} bytes`);
            const conteudo = await fs.promises.readFile(filePath, 'utf-8');
            console.log(`📖 Conteúdo lido: ${conteudo.length} caracteres`);
            const linhas = conteudo.split('\n');
            console.log(`📊 Linhas originais: ${linhas.length}`);
            const novasLinhas = [];
            let linhasRemovidas = 0;
            // LÓGICA AJUSTADA: Mantém apenas 1 linha vazia entre blocos
            let linhaAnteriorVazia = false;
            for (let i = 0; i < linhas.length; i++) {
                const linhaAtual = linhas[i];
                const linhaVazia = linhaAtual.trim() === '';
                if (linhaVazia) {
                    // Se a linha anterior também era vazia, remove esta
                    if (linhaAnteriorVazia) {
                        linhasRemovidas++;
                        continue; // Pula para a próxima linha
                    }
                    // Se é a primeira linha vazia, mantém
                    novasLinhas.push(linhaAtual);
                    linhaAnteriorVazia = true;
                }
                else {
                    // Linha com conteúdo
                    novasLinhas.push(linhaAtual);
                    linhaAnteriorVazia = false;
                }
            }
            // Remover linha vazia final se existir
            while (novasLinhas.length > 0 && novasLinhas[novasLinhas.length - 1].trim() === '') {
                novasLinhas.pop();
                linhasRemovidas++;
            }
            console.log(`📊 Linhas após processamento: ${novasLinhas.length}`);
            console.log(`📊 Linhas removidas: ${linhasRemovidas}`);
            const novoConteudo = novasLinhas.join('\n');
            if (linhasRemovidas > 0) {
                console.log(`💾 Salvando arquivo: ${filePath}`);
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
                console.log(`✅ Arquivo salvo com sucesso`);
            }
            else {
                console.log(`ℹ️ Nenhuma linha excedente encontrada, arquivo não modificado`);
            }
            return { linhasRemovidas };
        }
        catch (error) {
            console.error(`❌ Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }
    isArquivoTexto(nome) {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        const isTexto = extensoes.some(ext => nome.toLowerCase().endsWith(ext));
        return isTexto;
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vscode/codicons@latest/dist/codicon.css">
    <title>Ajustar Linhas Vazias</title>
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
            padding: 20px;
        }

        h1 {
            color: var(--vscode-titleBar-activeForeground);
            margin-bottom: 10px;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
            font-size: 14px;
        }

        .info-box {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textLink-foreground);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .info-icon {
            color: var(--vscode-textLink-foreground);
            font-size: 20px;
            flex-shrink: 0;
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
            padding: 8px;
            border-bottom: 1px solid var(--vscode-input-border);
            cursor: pointer;
            transition: background 0.2s;
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

        .file-icon {
            margin-right: 8px;
            width: 20px;
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
            font-family: var(--vscode-font-family);
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

        .primary-button {
            background: var(--vscode-button-background);
        }

        .primary-button:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
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
        Ajustar Linhas Vazias
    </h1>
    <p class="description">Remove linhas vazias excedentes mantendo apenas 1 linha entre blocos de código</p>
    
    <div class="info-box">
        <i class="codicon codicon-info info-icon"></i>
        <div>
            <strong>O que faz:</strong> Esta ferramenta mantém apenas UMA linha vazia entre blocos de código, 
            removendo linhas vazias excedentes. Ideal para padronizar a formatação do código.
            <br><br>
            <strong>Exemplo:</strong>
            <br>Antes: <code>função1()</code> → 3 linhas vazias → <code>função2()</code>
            <br>Depois: <code>função1()</code> → 1 linha vazia → <code>função2()</code>
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
        <button id="refreshBtn" class="secondary-button">
            <i class="codicon codicon-refresh"></i>
            Atualizar Lista
        </button>
        <button id="executeBtn" class="primary-button" disabled>
            <i class="codicon codicon-wand"></i>
            Executar Ajuste
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
            const refreshBtn = document.getElementById('refreshBtn');
            const executeBtn = document.getElementById('executeBtn');
            const resultsDiv = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');

            window.addEventListener('load', function() {
                console.log('Webview carregada, solicitando arquivos...');
                loadWorkspaceFiles();
            });

            selectAllBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('.file-checkbox');
                checkboxes.forEach(cb => cb.checked = true);
                updateExecuteButton();
            });

            deselectAllBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('.file-checkbox');
                checkboxes.forEach(cb => cb.checked = false);
                updateExecuteButton();
            });

            refreshBtn.addEventListener('click', function() {
                loadWorkspaceFiles();
            });

            executeBtn.addEventListener('click', function() {
                const selectedFiles = getSelectedFiles();

                if (selectedFiles.length === 0) {
                    showResult('<i class="codicon codicon-error"></i> Por favor, selecione pelo menos um arquivo ou pasta.', 'error');
                    return;
                }

                if (!confirm('Deseja ajustar as linhas vazias dos arquivos selecionados?\\n\\nEsta ação não pode ser desfeita.')) {
                    return;
                }

                executeBtn.disabled = true;
                executeBtn.innerHTML = '<i class="codicon codicon-loading codicon-modifier-spin"></i> Processando...';

                vscode.postMessage({
                    command: 'execute',
                    data: {
                        selections: selectedFiles,
                        workspacePath: '.'
                    }
                });
            });

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
                console.log('Renderizando', files.length, 'arquivos');
                
                if (!files || files.length === 0) {
                    fileExplorer.innerHTML = 
                        '<div class="empty-message">' +
                        '<div class="empty-icon"><i class="codicon codicon-folder-opened"></i></div>' +
                        '<p>Nenhum arquivo encontrado no workspace.</p>' +
                        '<p style="font-size: 12px; margin-top: 10px;">Abra uma pasta no VS Code e tente novamente.</p>' +
                        '</div>';
                    return;
                }

                let html = '';
                files.forEach(file => {
                    const iconClass = file.type === 'folder' ? 'codicon-folder' : 'codicon-file';
                    const iconColor = file.type === 'folder' ? 'folder-icon' : '';
                    const checked = file.selected ? 'checked' : '';
                    
                    html += 
                        '<div class="file-item">' +
                        '<input type="checkbox" class="file-checkbox" ' +
                        'data-name="' + escapeHtml(file.name) + '" ' +
                        'data-path="' + escapeHtml(file.path) + '" ' +
                        'data-type="' + escapeHtml(file.type) + '" ' + checked + '>' +
                        '<i class="codicon ' + iconClass + ' file-icon ' + iconColor + '"></i>' +
                        '<div class="file-info">' +
                        '<div class="file-name">' + escapeHtml(file.name) + '</div>' +
                        '<div class="file-path">' + escapeHtml(file.path) + '</div>' +
                        '</div>' +
                        '</div>';
                });
                
                fileExplorer.innerHTML = html;

                document.querySelectorAll('.file-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', updateExecuteButton);
                });

                updateExecuteButton();
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
                } else if (message.command === 'executionResult') {
                    executeBtn.disabled = false;
                    executeBtn.innerHTML = '<i class="codicon codicon-wand"></i> Executar Ajuste';
                    
                    if (message.result.success) {
                        const stats = message.result.stats || {};
                        let resultHTML = '<p><i class="codicon codicon-check"></i> <strong>Ajuste concluído com sucesso!</strong></p>';
                        
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
                            '<p><i class="codicon codicon-error"></i> <strong>Erro durante a execução:</strong></p>' +
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
}
exports.AjustarLinhasTool = AjustarLinhasTool;
//# sourceMappingURL=ajustar-linhas.tool.js.map