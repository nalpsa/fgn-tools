import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ITool, ToolCategory } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para remover TODAS as linhas vazias em arquivos
 */
export class RemoverTodasLinhasVaziasTool implements ITool {
    public readonly id = 'remover-todas-linhas-vazias';
    public readonly name = 'Remover TODAS as Linhas Vazias';
    public readonly description = 'Remove TODAS as linhas vazias dos arquivos selecionados';
    public readonly icon = 'clear-all';
    public readonly category = ToolCategory.FILE;

    private panel: vscode.WebviewPanel | undefined;

    public async activate(): Promise<void> {
        console.log('🎯 Ativando ferramenta: Remover TODAS as Linhas Vazias');
        this.openUI();
    }

    private openUI(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'removerTodasLinhasVazias',
            '🗑️ Remover TODAS as Linhas Vazias',
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
                case 'getEstrutura':
                    const estrutura = await this.listarPastas();
                    this.panel?.webview.postMessage({ 
                        command: 'estrutura', 
                        estrutura 
                    });
                    break;

                case 'processarSelecionados':
                    const resultado = await this.processarSelecionados(message.selecionados);
                    this.panel?.webview.postMessage({
                        command: 'processamentoConcluido',
                        resultado
                    });
                    break;
            }
        });
    }

    private async listarPastas(): Promise<any[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Nenhum workspace aberto!');
            return [];
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        return await this.listarRecursivo(workspacePath, workspacePath);
    }

    private async listarRecursivo(basePath: string, currentPath: string): Promise<any[]> {
        const itens: any[] = [];

        try {
            const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                // Ignorar pastas do sistema
                if (['node_modules', '.git', '.vscode', 'out', 'dist', 'build'].includes(entry.name)) {
                    continue;
                }

                const fullPath = path.join(currentPath, entry.name);
                const relativePath = path.relative(basePath, fullPath);

                if (entry.isDirectory()) {
                    const filhos = await this.listarRecursivo(basePath, fullPath);
                    itens.push({
                        id: relativePath,
                        nome: entry.name,
                        caminho: relativePath,
                        tipo: 'pasta',
                        filhos: filhos,
                        selecionado: false,
                        expandido: false
                    });
                } else if (this.isArquivoTexto(entry.name)) {
                    itens.push({
                        id: relativePath,
                        nome: entry.name,
                        caminho: relativePath,
                        tipo: 'arquivo',
                        selecionado: false
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao listar:', error);
        }

        return itens;
    }

    private async processarSelecionados(selecionados: any[]): Promise<{ 
        arquivos: number, 
        linhasRemovidas: number,
        arquivosProcessados: string[] 
    }> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { arquivos: 0, linhasRemovidas: 0, arquivosProcessados: [] };
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        let totalArquivos = 0;
        let totalLinhasRemovidas = 0;
        const arquivosProcessados: string[] = [];

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Removendo TODAS as linhas vazias...",
            cancellable: false
        }, async (progress) => {
            // Coletar todos os arquivos selecionados
            const arquivosParaProcessar = this.coletarArquivosSelecionados(selecionados);
            
            for (const arquivo of arquivosParaProcessar) {
                const fullPath = path.join(workspacePath, arquivo.caminho);
                const resultado = await this.processarArquivo(fullPath);
                
                if (resultado && resultado.linhasRemovidas > 0) {
                    totalArquivos++;
                    totalLinhasRemovidas += resultado.linhasRemovidas;
                    arquivosProcessados.push(arquivo.caminho);
                }

                progress.report({ 
                    message: `Processados: ${totalArquivos} de ${arquivosParaProcessar.length} arquivos` 
                });
            }
        });

        return { 
            arquivos: totalArquivos, 
            linhasRemovidas: totalLinhasRemovidas,
            arquivosProcessados 
        };
    }

    private coletarArquivosSelecionados(itens: any[]): any[] {
        const arquivos: any[] = [];

        const coletarRecursivo = (lista: any[]) => {
            for (const item of lista) {
                if (item.selecionado) {
                    if (item.tipo === 'arquivo') {
                        arquivos.push(item);
                    } else if (item.tipo === 'pasta' && item.filhos) {
                        coletarRecursivo(item.filhos);
                    }
                }
            }
        };

        coletarRecursivo(itens);
        return arquivos;
    }

    private async processarArquivo(filePath: string): Promise<{ linhasRemovidas: number } | null> {
        try {
            const conteudo = await fs.promises.readFile(filePath, 'utf-8');
            const linhas = conteudo.split('\n');
            const novasLinhas: string[] = [];
            let linhasRemovidas = 0;

            for (let i = 0; i < linhas.length; i++) {
                const linhaAtual = linhas[i];
                const linhaVazia = linhaAtual.trim() === '';

                if (!linhaVazia) {
                    // Mantém apenas linhas NÃO vazias
                    novasLinhas.push(linhaAtual);
                } else {
                    // Conta linhas vazias removidas
                    linhasRemovidas++;
                }
            }

            const novoConteudo = novasLinhas.join('\n');

            if (linhasRemovidas > 0) {
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
                return { linhasRemovidas };
            }

            return { linhasRemovidas: 0 };
        } catch (error) {
            console.error(`Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }

    private isArquivoTexto(nome: string): boolean {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        return extensoes.some(ext => nome.toLowerCase().endsWith(ext));
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Remover TODAS as Linhas Vazias</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            margin: 0;
        }
        
        h2 { 
            color: var(--vscode-titleBar-activeForeground); 
            margin-bottom: 20px; 
        }
        
        .info-box {
            background: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-left: 4px solid var(--vscode-errorForeground);
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        .btn:hover { 
            background: var(--vscode-button-hoverBackground); 
        }
        
        .btn:disabled { 
            opacity: 0.5; 
            cursor: not-allowed; 
        }
        
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-danger {
            background: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
        }
        
        #resultado {
            margin-top: 20px;
            padding: 15px;
            background: var(--vscode-input-background);
            border-radius: 4px;
            display: none;
        }
        
        #resultado.show { 
            display: block; 
        }
        
        .controles {
            margin: 20px 0;
            padding: 15px;
            background: var(--vscode-sideBar-background);
            border-radius: 4px;
        }
        
        .arvore {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 10px;
            background: var(--vscode-input-background);
            margin-bottom: 20px;
        }
        
        .item {
            margin: 5px 0;
            padding: 5px;
            display: flex;
            align-items: center;
        }
        
        .item:hover {
            background: var(--vscode-list-hoverBackground);
        }
        
        .pasta {
            font-weight: bold;
        }
        
        .arquivo {
            margin-left: 25px;
        }
        
        .checkbox {
            margin-right: 8px;
        }
        
        .expandir {
            margin-right: 5px;
            cursor: pointer;
            background: none;
            border: none;
            color: var(--vscode-foreground);
            width: 20px;
            height: 20px;
        }
        
        .contador {
            margin-left: 10px;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }
        
        .estatisticas {
            margin: 15px 0;
            padding: 10px;
            background: var(--vscode-textBlockQuote-background);
            border-radius: 4px;
        }
        
        .filhos {
            margin-left: 25px;
            display: none;
        }
        
        .filhos.expandido {
            display: block;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: var(--vscode-descriptionForeground);
        }
        
        .warning {
            color: var(--vscode-inputValidation-warningForeground);
            background: var(--vscode-inputValidation-warningBackground);
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h2>🗑️ Remover TODAS as Linhas Vazias</h2>
    
    <div class="info-box">
        <p><strong>⚠️ ATENÇÃO:</strong> Esta ferramenta remove <strong>TODAS</strong> as linhas vazias dos arquivos selecionados.</p>
        <p><strong>Diferença para "Ajustar Linhas Vazias":</strong> Enquanto a outra ferramenta mantém 1 linha entre blocos, esta remove COMPLETAMENTE todas as linhas vazias.</p>
        <p><strong>Arquivos suportados:</strong> .js, .ts, .jsx, .tsx, .html, .css, .scss, .json, .md, .txt, .py, .java, .cpp, .c, .php, .xml, .yaml, .yml</p>
    </div>

    <div class="controles">
        <button class="btn" onclick="selecionarTudo()">✅ Selecionar Tudo</button>
        <button class="btn btn-secondary" onclick="desmarcarTudo()">❌ Desmarcar Tudo</button>
        <button class="btn" onclick="expandirTudo()">📂 Expandir Tudo</button>
        <button class="btn btn-secondary" onclick="colapsarTudo()">📁 Colapsar Tudo</button>
    </div>

    <div id="arvore" class="loading">📄 Carregando estrutura de pastas...</div>

    <div class="estatisticas">
        <strong>📊 Estatísticas:</strong>
        <div id="estatisticas">0 arquivos selecionados</div>
    </div>

    <button id="btnIniciar" class="btn btn-danger" onclick="iniciarProcessamento()" disabled>⚠️ Remover TODAS as Linhas Vazias</button>
    
    <div id="resultado"></div>

    <script>
        const vscode = acquireVsCodeApi();
        let estrutura = [];

        window.addEventListener('load', () => {
            vscode.postMessage({ command: 'getEstrutura' });
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'estrutura') {
                estrutura = message.estrutura;
                renderizarArvore();
                atualizarEstatisticas();
            } else if (message.command === 'processamentoConcluido') {
                const resultado = document.getElementById('resultado');
                resultado.innerHTML = \`
                    <strong>✅ Processamento Concluído!</strong><br>
                    📊 \${message.resultado.arquivos} arquivo(s) processado(s)<br>
                    🗑️ \${message.resultado.linhasRemovidas} linha(s) vazia(s) removida(s) COMPLETAMENTE
                    \${message.resultado.arquivosProcessados.length > 0 ? 
                        '<br><br><strong>Arquivos modificados:</strong><br>' + 
                        message.resultado.arquivosProcessados.map(arq => '• ' + arq).join('<br>') : 
                        ''
                    }
                \`;
                resultado.classList.add('show');
                document.getElementById('btnIniciar').disabled = false;
                document.getElementById('btnIniciar').textContent = '⚠️ Remover TODAS as Linhas Vazias';
            }
        });

        function renderizarArvore() {
            const container = document.getElementById('arvore');
            if (!estrutura || estrutura.length === 0) {
                container.innerHTML = '<div class="loading">Nenhum arquivo encontrado no workspace.</div>';
                return;
            }
            
            container.innerHTML = '<strong>✅ Estrutura carregada!</strong><br>' + 
                                 renderizarItens(estrutura);
            container.classList.remove('loading');
        }

        function renderizarItens(itens, nivel = 0) {
            let html = '';
            itens.forEach(item => {
                const indent = nivel * 25;
                
                if (item.tipo === 'pasta') {
                    html += \`
                        <div class="item pasta" style="margin-left: \${indent}px">
                            <button class="expandir" onclick="toggleExpandir('\${item.id}')">
                                \${item.expandido ? '📂' : '📁'}
                            </button>
                            <input type="checkbox" class="checkbox" id="\${item.id}" 
                                   \${item.selecionado ? 'checked' : ''} 
                                   onchange="toggleItem('\${item.id}', this.checked)">
                            <span>\${item.nome}</span>
                            <span class="contador">(\${contarArquivos(item)} arquivos)</span>
                        </div>
                        <div id="filhos-\${item.id}" class="filhos \${item.expandido ? 'expandido' : ''}">
                            \${item.expandido ? renderizarItens(item.filhos, nivel + 1) : ''}
                        </div>
                    \`;
                } else {
                    html += \`
                        <div class="item arquivo" style="margin-left: \${indent}px">
                            <input type="checkbox" class="checkbox" id="\${item.id}" 
                                   \${item.selecionado ? 'checked' : ''} 
                                   onchange="toggleItem('\${item.id}', this.checked)">
                            <span>📄 \${item.nome}</span>
                        </div>
                    \`;
                }
            });
            return html;
        }

        function contarArquivos(item) {
            if (item.tipo === 'arquivo') return 1;
            let total = 0;
            if (item.filhos) {
                item.filhos.forEach(filho => {
                    total += contarArquivos(filho);
                });
            }
            return total;
        }

        function encontrarItem(id, itens = estrutura) {
            for (const item of itens) {
                if (item.id === id) return item;
                if (item.filhos) {
                    const encontrado = encontrarItem(id, item.filhos);
                    if (encontrado) return encontrado;
                }
            }
            return null;
        }

        function toggleExpandir(id) {
            const item = encontrarItem(id);
            if (item && item.tipo === 'pasta') {
                item.expandido = !item.expandido;
                renderizarArvore();
            }
        }

        function toggleItem(id, selecionado) {
            const item = encontrarItem(id);
            if (item) {
                item.selecionado = selecionado;
                
                // Se for pasta, aplicar a todos os filhos
                if (item.tipo === 'pasta' && item.filhos) {
                    aplicarSelecaoRecursiva(item.filhos, selecionado);
                }
                
                renderizarArvore();
                atualizarEstatisticas();
            }
        }

        function aplicarSelecaoRecursiva(itens, selecionado) {
            itens.forEach(item => {
                item.selecionado = selecionado;
                if (item.filhos) {
                    aplicarSelecaoRecursiva(item.filhos, selecionado);
                }
            });
        }

        function selecionarTudo() {
            aplicarSelecaoRecursiva(estrutura, true);
            renderizarArvore();
            atualizarEstatisticas();
        }

        function desmarcarTudo() {
            aplicarSelecaoRecursiva(estrutura, false);
            renderizarArvore();
            atualizarEstatisticas();
        }

        function expandirTudo() {
            aplicarExpansaoRecursiva(estrutura, true);
            renderizarArvore();
        }

        function colapsarTudo() {
            aplicarExpansaoRecursiva(estrutura, false);
            renderizarArvore();
        }

        function aplicarExpansaoRecursiva(itens, expandir) {
            itens.forEach(item => {
                if (item.tipo === 'pasta') {
                    item.expandido = expandir;
                    if (item.filhos) {
                        aplicarExpansaoRecursiva(item.filhos, expandir);
                    }
                }
            });
        }

        function atualizarEstatisticas() {
            const totalSelecionados = contarSelecionados(estrutura);
            const estatisticasEl = document.getElementById('estatisticas');
            const btnIniciar = document.getElementById('btnIniciar');
            
            estatisticasEl.textContent = \`\${totalSelecionados} arquivo(s) selecionado(s)\`;
            btnIniciar.disabled = totalSelecionados === 0;
        }

        function contarSelecionados(itens) {
            let count = 0;
            itens.forEach(item => {
                if (item.selecionado && item.tipo === 'arquivo') {
                    count++;
                }
                if (item.filhos) {
                    count += contarSelecionados(item.filhos);
                }
            });
            return count;
        }

        function coletarSelecionados() {
            const selecionados = [];
            function coletar(itens) {
                itens.forEach(item => {
                    if (item.selecionado) {
                        selecionados.push(item);
                    }
                    if (item.filhos) {
                        coletar(item.filhos);
                    }
                });
            }
            coletar(estrutura);
            return selecionados;
        }

        function iniciarProcessamento() {
            const selecionados = coletarSelecionados();
            const arquivosSelecionados = selecionados.filter(item => item.tipo === 'arquivo');
            
            if (arquivosSelecionados.length === 0) {
                alert('Selecione pelo menos um arquivo para processar.');
                return;
            }
            
            // Confirmação extra por ser uma ação destrutiva
            const confirmacao = confirm('⚠️ ATENÇÃO: Esta ação removerá TODAS as linhas vazias dos arquivos selecionados.\\n\\nEsta operação não pode ser desfeita.\\n\\nDeseja continuar?');
            
            if (!confirmacao) {
                return;
            }
            
            const btn = document.getElementById('btnIniciar');
            btn.disabled = true;
            btn.textContent = '⏳ Removendo TODAS as linhas vazias...';
            
            vscode.postMessage({ 
                command: 'processarSelecionados', 
                selecionados: selecionados 
            });
        }
    </script>
</body>
</html>`;
    }
}
