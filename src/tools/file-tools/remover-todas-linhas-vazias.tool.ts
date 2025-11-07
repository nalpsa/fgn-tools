import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ITool, ToolCategory, ToolResult } from '../../core/interfaces/tool.interface';

export class RemoveAllEmptyLinesTool implements ITool {
    id = 'remove-all-empty-lines';
    name = 'Remover Todas Linhas Vazias';
    description = 'Remove completamente todas as linhas em branco';
    public readonly icon = '🧹';
    category = ToolCategory.FILE;

    private panel: vscode.WebviewPanel | undefined;

    async execute(input: any): Promise<ToolResult> {
        try {
            // Sempre abre a UI para seleção interativa
            this.openUI();
            return {
                success: true,
                output: 'UI aberta para seleção de arquivos'
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ Erro no RemoveAllEmptyLinesTool:', errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    private openUI(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'removeAllEmptyLines',
            '🧹 Remover Todas Linhas Vazias',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupMessageListener();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private setupMessageListener(): void {
        if (!this.panel) return;

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

    private async executeTool(input: any): Promise<ToolResult> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return {
                success: false,
                error: 'Nenhum workspace aberto'
            };
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        
        console.log(`🔧 RemoveAllEmptyLinesTool executando...`);
        console.log(`📂 Workspace: ${workspacePath}`);
        console.log(`📄 Seleções: ${input.selections.length}`);
        
        try {
            let totalArquivos = 0;
            let totalLinhasRemovidas = 0;

            for (const selection of input.selections) {
                if (selection.selected) {
                    console.log(`📋 Processando: ${selection.name} (${selection.type}) - ${selection.path}`);
                    
                    const fullPath = path.join(workspacePath, selection.path);
                    console.log(`📁 Caminho completo: ${fullPath}`);
                    
                    if (selection.type === 'folder') {
                        const resultado = await this.processarPasta(fullPath);
                        totalArquivos += resultado.arquivos;
                        totalLinhasRemovidas += resultado.linhas;
                        console.log(`📊 Pasta processada: ${resultado.arquivos} arquivos, ${resultado.linhas} linhas removidas`);
                    } else {
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
        } catch (error) {
            console.error(`❌ Erro no RemoveAllEmptyLinesTool:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Erro ao processar: ${errorMessage}`
            };
        }
    }

    private async getWorkspaceFiles(): Promise<any[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('❌ Nenhum workspace aberto');
            return [];
        }

        const files: any[] = [];
        
        try {
            const workspaceFolder = workspaceFolders[0];
            console.log(`📁 Workspace: ${workspaceFolder.name} (${workspaceFolder.uri.fsPath})`);

            // Usar findFiles para buscar arquivos
            const allFiles = await vscode.workspace.findFiles(
                '**/*',
                '**/node_modules/**,**/.git/**,**/out/**,**/dist/**,**/build/**,**/.vscode/**'
            );

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
                } catch (error) {
                    console.error(`❌ Erro ao processar arquivo ${file.fsPath}:`, error);
                }
            }

            console.log(`✅ Arquivos de texto encontrados: ${files.length - 1}`); // -1 para a pasta raiz

        } catch (error) {
            console.error('❌ Erro ao carregar arquivos do workspace:', error);
        }

        return files;
    }

    private async processarPasta(pastaPath: string): Promise<{arquivos: number, linhas: number}> {
        console.log(`📁 Processando pasta: ${pastaPath}`);
        let arquivos = 0;
        let linhas = 0;

        const processarRecursivo = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                console.log(`📂 Conteúdo de ${dir}: ${entries.length} entradas`);
                
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    
                    if (entry.isDirectory()) {
                        console.log(`📁 Subpasta: ${entry.name}`);
                        await processarRecursivo(fullPath);
                    } else if (this.isArquivoTexto(entry.name)) {
                        console.log(`📄 Arquivo texto: ${entry.name}`);
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            arquivos++;
                            linhas += resultado.linhasRemovidas;
                        }
                    } else {
                        console.log(`⏭️  Ignorando: ${entry.name} (não é arquivo texto)`);
                    }
                }
            } catch (error) {
                console.error(`❌ Erro ao processar pasta ${dir}:`, error);
            }
        };

        await processarRecursivo(pastaPath);
        return { arquivos, linhas };
    }

    private async processarArquivo(filePath: string): Promise<{linhasRemovidas: number} | null> {
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
            console.log(`📝 Conteúdo lido: ${conteudo.length} caracteres`);
            
            const linhas = conteudo.split('\n');
            console.log(`📊 Linhas originais: ${linhas.length}`);

            const novasLinhas: string[] = [];
            let linhasRemovidas = 0;

            // LÓGICA SIMPLES: Remove TODAS as linhas vazias
            for (const linha of linhas) {
                if (linha.trim() !== '') {
                    novasLinhas.push(linha);
                } else {
                    linhasRemovidas++;
                }
            }

            console.log(`📊 Linhas após processamento: ${novasLinhas.length}`);
            console.log(`📊 Linhas removidas: ${linhasRemovidas}`);

            const novoConteudo = novasLinhas.join('\n');
            
            if (linhasRemovidas > 0) {
                console.log(`💾 Salvando arquivo: ${filePath}`);
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
                console.log(`✅ Arquivo salvo com sucesso`);
            } else {
                console.log(`ℹ️  Nenhuma linha vazia encontrada, arquivo não modificado`);
            }

            return { linhasRemovidas };
        } catch (error) {
            console.error(`❌ Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }

    private isArquivoTexto(nome: string): boolean {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        const isTexto = extensoes.some(ext => nome.toLowerCase().endsWith(ext));
        return isTexto;
    }

    private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remover Todas Linhas Vazias</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            margin: 0;
        }

        h1 {
            color: var(--vscode-titleBar-activeForeground);
            margin-bottom: 10px;
        }

        .description {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 20px;
        }

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
            padding: 10px;
            border-bottom: 1px solid var(--vscode-input-border);
        }

        .file-item:last-child {
            border-bottom: none;
        }

        .file-checkbox {
            margin-right: 10px;
        }

        .file-icon {
            margin-right: 8px;
            width: 16px;
            text-align: center;
        }

        .file-info {
            flex: 1;
        }

        .file-name {
            color: var(--vscode-foreground);
            font-weight: 500;
        }

        .file-path {
            color: var(--vscode-descriptionForeground);
            font-size: 0.85em;
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
            padding: 10px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
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

        .empty-message {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h1>Remover Todas Linhas Vazias</h1>
    <p class="description">Remove completamente todas as linhas em branco</p>
    
    <div class="warning-box">
        <strong>Atencao:</strong> Esta ferramenta removera TODAS as linhas vazias dos arquivos selecionados.
        Esta acao nao pode ser desfeita. Recomendamos fazer backup dos arquivos antes de prosseguir.
    </div>

    <div class="file-explorer" id="fileExplorer">
        <div class="loading">
            <p>Carregando estrutura de arquivos...</p>
        </div>
    </div>

    <div class="action-buttons">
        <button id="selectAllBtn">Selecionar Tudo</button>
        <button id="deselectAllBtn">Desmarcar Tudo</button>
        <button id="refreshBtn">Atualizar Lista</button>
        <button id="executeBtn" class="danger-button">Executar Remocao</button>
    </div>

    <div id="results" class="results">
        <h3>Resultado da Execucao:</h3>
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

            // Solicitar lista de arquivos ao carregar
            window.addEventListener('load', function() {
                loadWorkspaceFiles();
            });

            selectAllBtn.addEventListener('click', function() {
                var checkboxes = document.querySelectorAll('.file-checkbox');
                for (var i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = true;
                }
                updateExecuteButton();
            });

            deselectAllBtn.addEventListener('click', function() {
                var checkboxes = document.querySelectorAll('.file-checkbox');
                for (var i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = false;
                }
                updateExecuteButton();
            });

            refreshBtn.addEventListener('click', function() {
                loadWorkspaceFiles();
            });

            executeBtn.addEventListener('click', function() {
                var checkboxes = document.querySelectorAll('.file-checkbox:checked');
                var selectedFiles = [];
                
                for (var i = 0; i < checkboxes.length; i++) {
                    var checkbox = checkboxes[i];
                    selectedFiles.push({
                        name: checkbox.getAttribute('data-name'),
                        path: checkbox.getAttribute('data-path'),
                        type: checkbox.getAttribute('data-type'),
                        selected: true
                    });
                }

                if (selectedFiles.length === 0) {
                    showResult('Por favor, selecione pelo menos um arquivo ou pasta.', 'error');
                    return;
                }

                var userConfirmed = confirm('ATENCAO: Esta acao nao pode ser desfeita.\\n\\nDeseja continuar?');
                if (!userConfirmed) {
                    return;
                }

                executeBtn.disabled = true;
                executeBtn.textContent = 'Processando...';

                vscode.postMessage({
                    command: 'execute',
                    data: {
                        selections: selectedFiles,
                        workspacePath: '.'
                    }
                });
            });

            function updateExecuteButton() {
                var selectedFiles = document.querySelectorAll('.file-checkbox:checked');
                executeBtn.disabled = selectedFiles.length === 0;
            }

            function loadWorkspaceFiles() {
                fileExplorer.innerHTML = '<div class="loading"><p>Carregando estrutura de arquivos...</p></div>';
                executeBtn.disabled = true;
                vscode.postMessage({
                    command: 'getWorkspaceFiles'
                });
            }

            function showResult(message, type) {
                if (!type) type = 'success';
                resultsDiv.style.display = 'block';
                resultsDiv.className = 'results ' + type;
                resultContent.innerHTML = message;
            }

            function renderFileExplorer(files) {
                if (!files || files.length === 0) {
                    fileExplorer.innerHTML = '<div class="empty-message"><p>Nenhum arquivo encontrado no workspace.</p></div>';
                    return;
                }

                var html = '';
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var icon = file.type === 'folder' ? '[Pasta]' : '[Arquivo]';
                    var checked = file.selected ? 'checked' : '';
                    
                    html += '<div class="file-item">' +
                        '<input type="checkbox" class="file-checkbox" ' +
                        'data-name="' + escapeHtml(file.name) + '" ' +
                        'data-path="' + escapeHtml(file.path) + '" ' +
                        'data-type="' + escapeHtml(file.type) + '" ' + checked + '>' +
                        '<span class="file-icon">' + icon + '</span>' +
                        '<div class="file-info">' +
                        '<div class="file-name">' + escapeHtml(file.name) + '</div>' +
                        '<div class="file-path">' + escapeHtml(file.path) + '</div>' +
                        '</div>' +
                        '</div>';
                }
                
                fileExplorer.innerHTML = html;

                var checkboxes = document.querySelectorAll('.file-checkbox');
                for (var j = 0; j < checkboxes.length; j++) {
                    checkboxes[j].addEventListener('change', updateExecuteButton);
                }

                updateExecuteButton();
            }

            function escapeHtml(text) {
                if (!text) return '';
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            window.addEventListener('message', function(event) {
                var message = event.data;
                
                if (message.command === 'workspaceFiles') {
                    console.log('Arquivos recebidos:', message.files);
                    renderFileExplorer(message.files);
                } else if (message.command === 'executionResult') {
                    executeBtn.disabled = false;
                    executeBtn.textContent = 'Executar Remocao';
                    
                    if (message.result.success) {
                        var stats = message.result.stats || {};
                        var resultHTML = '<p>Remocao concluida com sucesso!</p>';
                        
                        if (stats.filesProcessed > 0 || stats.linesChanged > 0) {
                            resultHTML += '<p>';
                            if (stats.filesProcessed > 0) {
                                resultHTML += '<strong>' + stats.filesProcessed + '</strong> arquivo(s) processado(s)';
                            }
                            if (stats.filesProcessed > 0 && stats.linesChanged > 0) {
                                resultHTML += ' - ';
                            }
                            if (stats.linesChanged > 0) {
                                resultHTML += '<strong>' + stats.linesChanged + '</strong> linha(s) removida(s)';
                            }
                            resultHTML += '</p>';
                        }
                        
                        showResult(resultHTML, 'success');
                    } else {
                        showResult(
                            '<p>Erro durante a execucao:</p>' +
                            '<p>' + escapeHtml(message.result.error || 'Erro desconhecido') + '</p>',
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