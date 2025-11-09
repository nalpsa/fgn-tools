"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSelectorScript = void 0;
/**
 * JavaScript para o seletor de arquivos
 * Reutilizável por todas as file tools
 *
 * REFATORADO: Corrigido hierarquia de árvore e habilitação do botão
 */
class FileSelectorScript {
    /**
     * Retorna o script JavaScript completo
     */
    getScript() {
        return `
        (function() {
            'use strict';
            
            const vscode = acquireVsCodeApi();
            
            // ============================================================
            // ELEMENTOS DOM
            // ============================================================
            
            const fileExplorer = document.getElementById('fileExplorer');
            const selectAllBtn = document.getElementById('selectAllBtn');
            const deselectAllBtn = document.getElementById('deselectAllBtn');
            const expandAllBtn = document.getElementById('expandAllBtn');
            const collapseAllBtn = document.getElementById('collapseAllBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const executeBtn = document.getElementById('executeBtn');
            const resultsDiv = document.getElementById('results');
            const resultContent = document.getElementById('resultContent');
            const statisticsDiv = document.getElementById('statistics');

            let filesData = [];

            // ============================================================
            // INICIALIZAÇÃO
            // ============================================================

            window.addEventListener('load', function() {
                console.log('File selector carregado, solicitando arquivos...');
                loadWorkspaceFiles();
            });

            // ============================================================
            // EVENT LISTENERS DOS BOTÕES
            // ============================================================

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
                executeProcessing();
            });

            // ============================================================
            // FUNÇÕES DE SELEÇÃO
            // ============================================================

            function selectAll(checked) {
                const checkboxes = document.querySelectorAll('.file-checkbox');
                checkboxes.forEach(cb => cb.checked = checked);
                updateStatistics();
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
                    const chevronIcon = icon.querySelector('i');
                    if (chevronIcon) {
                        chevronIcon.className = expand 
                            ? 'codicon codicon-chevron-down'
                            : 'codicon codicon-chevron-right';
                    }
                });
            }

            // ============================================================
            // FUNÇÕES DE EXECUÇÃO
            // ============================================================

            function loadWorkspaceFiles() {
                vscode.postMessage({ command: 'getWorkspaceFiles' });
            }

            function executeProcessing() {
                const selectedFiles = getSelectedFiles();
                
                if (selectedFiles.length === 0) {
                    showResult(
                        '<p><i class="codicon codicon-warning"></i> <strong>Nenhum arquivo selecionado</strong></p>' +
                        '<p style="margin-top: 10px;">Por favor, selecione pelo menos um arquivo ou pasta para processar.</p>',
                        'warning'
                    );
                    return;
                }

                console.log('Executando com', selectedFiles.length, 'seleções');

                // Desabilitar botão durante processamento
                executeBtn.disabled = true;
                executeBtn.innerHTML = '<i class="codicon codicon-loading codicon-modifier-spin"></i> Processando...';

                vscode.postMessage({
                    command: 'confirmExecution',
                    data: {
                        selections: selectedFiles,
                        workspacePath: '.'
                    }
                });
            }

            function getSelectedFiles() {
                const selected = [];
                const checkboxes = document.querySelectorAll('.file-checkbox:checked');
                
                checkboxes.forEach(cb => {
                    const fileData = JSON.parse(cb.dataset.file);
                    selected.push({
                        path: fileData.path,
                        name: fileData.name,
                        type: fileData.type,
                        selected: true
                    });
                });
                
                return selected;
            }

            // ============================================================
            // FUNÇÕES DE RENDERIZAÇÃO
            // ============================================================

            function renderFileExplorer(files) {
                console.log('===== RENDER FILE EXPLORER =====');
                console.log('Renderizando', files ? files.length : 0, 'arquivos');
                filesData = files;
                
                if (!files || files.length === 0) {
                    console.log('Nenhum arquivo - mostrando mensagem vazia');
                    fileExplorer.innerHTML = 
                        '<div class="empty-message">' +
                        '<div class="empty-icon"><i class="codicon codicon-folder-opened"></i></div>' +
                        '<p>Nenhum arquivo encontrado no workspace.</p>' +
                        '<p style="font-size: 12px; margin-top: 10px;">Abra uma pasta no VS Code e tente novamente.</p>' +
                        '</div>';
                    updateStatistics();
                    return;
                }

                console.log('Construindo árvore...');
                const tree = buildTree(files);
                console.log('Árvore construída:', tree);
                
                console.log('Renderizando árvore...');
                const treeHTML = renderTree(tree);
                console.log('HTML gerado, length:', treeHTML.length);
                
                fileExplorer.innerHTML = treeHTML;
                console.log('innerHTML definido, children count:', fileExplorer.children.length);

                setupEventListeners();
                updateStatistics();
                console.log('===== FIM RENDER =====');
            }

            function buildTree(files) {
                console.log('🌳 buildTree: recebidos', files.length, 'arquivos');
                
                // Pular o primeiro item se for a raiz '.'
                const actualFiles = files.filter(f => f.path !== '.');
                console.log('📁 Arquivos reais (sem raiz):', actualFiles.length);
                
                const fileMap = new Map();
                const folderMap = new Map();
                
                // Primeiro: criar estrutura de pastas baseada nos caminhos dos arquivos
                actualFiles.forEach(file => {
                    const parts = file.path.split(/[\\/]/);  // Suporta / e \\
                    
                    // Criar pastas intermediárias
                    for (let i = 0; i < parts.length - 1; i++) {
                        const folderPath = parts.slice(0, i + 1).join('/');
                        
                        if (!folderMap.has(folderPath)) {
                            folderMap.set(folderPath, {
                                name: parts[i],
                                path: folderPath,
                                type: 'folder',
                                selected: true,
                                expanded: false,
                                children: []
                            });
                        }
                    }
                    
                    // Adicionar arquivo ao mapa
                    fileMap.set(file.path, {
                        ...file,
                        selected: true
                    });
                });
                
                console.log('📂 Pastas criadas:', folderMap.size);
                console.log('📄 Arquivos mapeados:', fileMap.size);
                
                // Segundo: organizar pastas em hierarquia
                const rootItems = [];
                
                folderMap.forEach((folder, path) => {
                    const parts = path.split('/');
                    
                    if (parts.length === 1) {
                        // Pasta de nível raiz
                        rootItems.push(folder);
                    } else {
                        // Subpasta - adicionar ao pai
                        const parentPath = parts.slice(0, -1).join('/');
                        const parent = folderMap.get(parentPath);
                        
                        if (parent) {
                            parent.children.push(folder);
                        } else {
                            // Se não encontrou pai, adicionar na raiz
                            rootItems.push(folder);
                        }
                    }
                });
                
                // Terceiro: adicionar arquivos às suas pastas
                fileMap.forEach((file, path) => {
                    const parts = path.split(/[\\/]/);
                    
                    if (parts.length === 1) {
                        // Arquivo na raiz
                        rootItems.push(file);
                    } else {
                        // Arquivo dentro de pasta
                        const parentPath = parts.slice(0, -1).join('/');
                        const parent = folderMap.get(parentPath);
                        
                        if (parent) {
                            parent.children.push(file);
                        } else {
                            // Se não encontrou pai, adicionar na raiz
                            rootItems.push(file);
                        }
                    }
                });
                
                // Quarto: ordenar tudo (pastas primeiro, depois arquivos, alfabético)
                const sortItems = (items) => {
                    items.sort((a, b) => {
                        // Pastas primeiro
                        if (a.type === 'folder' && b.type === 'file') return -1;
                        if (a.type === 'file' && b.type === 'folder') return 1;
                        // Alfabético
                        return a.name.localeCompare(b.name);
                    });
                    
                    // Recursivamente ordenar filhos
                    items.forEach(item => {
                        if (item.children && item.children.length > 0) {
                            sortItems(item.children);
                        }
                    });
                };
                
                sortItems(rootItems);
                
                console.log('✅ Árvore final:', rootItems.length, 'itens na raiz');
                
                return { children: rootItems };
            }

            function renderTree(tree) {
                let html = '';
                
                if (tree.children && tree.children.length > 0) {
                    tree.children.forEach(item => {
                        if (item.type === 'folder') {
                            html += renderFolder(item);
                        } else {
                            html += renderFile(item);
                        }
                    });
                }
                
                return html;
            }

            function renderFolder(folder) {
                const hasChildren = folder.children && folder.children.length > 0;
                const chevronClass = folder.expanded ? 'codicon-chevron-down' : 'codicon-chevron-right';
                const childrenClass = folder.expanded ? '' : 'collapsed';
                
                let html = '<div class="folder-item">';
                
                // Cabeçalho da pasta
                html += '<div class="folder-header">';
                html += '<span class="expand-icon" data-path="' + escapeHtml(folder.path) + '">';
                html += '<i class="codicon ' + chevronClass + '"></i>';
                html += '</span>';
                html += '<input type="checkbox" class="file-checkbox folder-checkbox" data-file=\\'' + 
                        escapeHtml(JSON.stringify(folder)) + '\\' checked>';
                html += '<i class="codicon codicon-folder"></i>';
                html += '<span class="file-name">' + escapeHtml(folder.name) + '</span>';
                html += '</div>';
                
                // Filhos da pasta
                if (hasChildren) {
                    html += '<div class="folder-children ' + childrenClass + '" data-path="' + escapeHtml(folder.path) + '">';
                    folder.children.forEach(child => {
                        if (child.type === 'folder') {
                            html += renderFolder(child);
                        } else {
                            html += renderFile(child);
                        }
                    });
                    html += '</div>';
                }
                
                html += '</div>';
                
                return html;
            }

            function renderFile(file) {
                const icon = getFileIcon(file.name);
                
                let html = '<div class="file-item">';
                html += '<input type="checkbox" class="file-checkbox" data-file=\\'' + 
                        escapeHtml(JSON.stringify(file)) + '\\' checked>';
                html += '<i class="codicon codicon-' + icon + '"></i>';
                html += '<span class="file-name">' + escapeHtml(file.name) + '</span>';
                html += '</div>';
                
                return html;
            }

            function getFileIcon(filename) {
                const ext = filename.split('.').pop().toLowerCase();
                const iconMap = {
                    'js': 'file-code',
                    'ts': 'file-code',
                    'jsx': 'file-code',
                    'tsx': 'file-code',
                    'json': 'json',
                    'md': 'markdown',
                    'html': 'file-code',
                    'css': 'file-code',
                    'scss': 'file-code',
                    'py': 'file-code',
                    'java': 'file-code',
                    'php': 'file-code',
                    'rb': 'file-code',
                    'go': 'file-code',
                    'rs': 'file-code',
                    'c': 'file-code',
                    'cpp': 'file-code',
                    'h': 'file-code',
                    'txt': 'file-text',
                    'xml': 'file-code',
                    'yaml': 'file-code',
                    'yml': 'file-code'
                };
                
                return iconMap[ext] || 'file';
            }

            function setupEventListeners() {
                // Expand/collapse folders
                const expandIcons = document.querySelectorAll('.expand-icon');
                expandIcons.forEach(icon => {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const path = this.dataset.path;
                        const children = document.querySelector('.folder-children[data-path="' + path + '"]');
                        const chevron = this.querySelector('i');
                        
                        if (children) {
                            children.classList.toggle('collapsed');
                            chevron.classList.toggle('codicon-chevron-right');
                            chevron.classList.toggle('codicon-chevron-down');
                        }
                    });
                });

                // Folder checkbox: select/deselect all children
                const folderCheckboxes = document.querySelectorAll('.folder-checkbox');
                folderCheckboxes.forEach(cb => {
                    cb.addEventListener('change', function() {
                        const folderData = JSON.parse(this.dataset.file);
                        const children = document.querySelector('.folder-children[data-path="' + folderData.path + '"]');
                        
                        if (children) {
                            const childCheckboxes = children.querySelectorAll('.file-checkbox');
                            childCheckboxes.forEach(childCb => {
                                childCb.checked = this.checked;
                            });
                        }
                        
                        updateStatistics();
                    });
                });

                // File checkbox: update statistics
                const fileCheckboxes = document.querySelectorAll('.file-checkbox:not(.folder-checkbox)');
                fileCheckboxes.forEach(cb => {
                    cb.addEventListener('change', function() {
                        updateStatistics();
                    });
                });
            }

            function updateStatistics() {
                const totalCheckboxes = document.querySelectorAll('.file-checkbox:not(.folder-checkbox)');
                const selectedCheckboxes = document.querySelectorAll('.file-checkbox:not(.folder-checkbox):checked');
                
                const total = totalCheckboxes.length;
                const selected = selectedCheckboxes.length;
                
                statisticsDiv.innerHTML = 
                    '<i class="codicon codicon-info"></i> <strong>Estatísticas:</strong><br>' +
                    selected + ' arquivo(s) selecionado(s)';
                
                // ✅ CORRIGIDO: Habilitar botão quando houver arquivos selecionados
                executeBtn.disabled = selected === 0;
            }

            function showResult(html, type) {
                resultContent.innerHTML = html;
                resultsDiv.className = 'results show ' + type;
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    resultsDiv.classList.remove('show');
                }, 5000);
            }

            function escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // ============================================================
            // MENSAGENS DO BACKEND
            // ============================================================

            window.addEventListener('message', function(event) {
                const message = event.data;
                console.log('📨 Mensagem recebida:', message.command);
                
                if (message.command === 'workspaceFiles') {
                    // ✅ CORRIGIDO: Acessar message.data.files
                    const files = message.data?.files || message.files || [];
                    console.log('📦 Arquivos recebidos:', files.length);
                    renderFileExplorer(files);
                    
                } else if (message.command === 'executionStarted') {
                    console.log('🚀 Execução iniciada');
                    executeBtn.disabled = true;
                    executeBtn.innerHTML = '<i class="codicon codicon-loading codicon-modifier-spin"></i> Processando...';
                    
                } else if (message.command === 'executionResult') {
                    console.log('✅ Resultado da execução recebido');
                    
                    // ✅ CORRIGIDO: Acessar message.data.result
                    const result = message.data?.result || message.result || {};
                    
                    if (result.success) {
                        const stats = result.stats || {};
                        let resultHTML = '<p><i class="codicon codicon-check"></i> <strong>Processamento concluído com sucesso!</strong></p>';
                        
                        if (stats.filesProcessed > 0 || stats.linesChanged > 0) {
                            resultHTML += '<p style="margin-top: 10px;">';
                            if (stats.filesProcessed > 0) {
                                resultHTML += '<i class="codicon codicon-file"></i> <strong>' + stats.filesProcessed + '</strong> arquivo(s) processado(s)';
                            }
                            if (stats.filesProcessed > 0 && stats.linesChanged > 0) {
                                resultHTML += ' • ';
                            }
                            if (stats.linesChanged > 0) {
                                resultHTML += '<i class="codicon codicon-edit"></i> <strong>' + stats.linesChanged + '</strong> linha(s) modificada(s)';
                            }
                            resultHTML += '</p>';
                        }
                        
                        showResult(resultHTML, 'success');
                    } else {
                        showResult(
                            '<p><i class="codicon codicon-error"></i> <strong>Erro durante a execução:</strong></p>' +
                            '<p style="margin-top: 10px;">' + escapeHtml(result.error || 'Erro desconhecido') + '</p>',
                            'error'
                        );
                    }
                    
                    // Re-habilitar botão e atualizar estatísticas
                    executeBtn.disabled = false;
                    executeBtn.innerHTML = '<i class="codicon codicon-play"></i> Executar';
                    updateStatistics();
                }
            });
        })();`;
    }
}
exports.FileSelectorScript = FileSelectorScript;
//# sourceMappingURL=file-selector.script.js.map