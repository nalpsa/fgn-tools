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
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para remover linhas vazias duplicadas em arquivos
 * Mantém apenas 1 linha vazia entre blocos de código
 */
class AjustarLinhasTool {
    constructor() {
        this.id = 'ajustar-linhas';
        this.name = 'Ajustar Linhas Vazias';
        this.description = 'Remove linhas vazias duplicadas mantendo apenas 1 linha entre blocos';
        this.icon = 'whole-word';
        this.category = tool_interface_1.ToolCategory.FILE;
    }
    async activate() {
        console.log('🎯 Ativando ferramenta: Ajustar Linhas');
        this.openUI();
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
                case 'getPastas':
                    const pastas = await this.listarPastas();
                    this.panel?.webview.postMessage({ command: 'pastas', pastas });
                    break;
                case 'iniciarProcessamento':
                    const resultado = await this.processarSelecionados(message.selecionados);
                    this.panel?.webview.postMessage({
                        command: 'processamentoConcluido',
                        resultado
                    });
                    break;
            }
        });
    }
    async listarPastas() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Nenhum workspace aberto!');
            return [];
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        return await this.listarRecursivo(workspacePath, workspacePath);
    }
    async listarRecursivo(basePath, currentPath) {
        const itens = [];
        try {
            const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
            for (const entry of entries) {
                if (['node_modules', '.git', '.vscode', 'out', 'dist', 'build'].includes(entry.name)) {
                    continue;
                }
                const fullPath = path.join(currentPath, entry.name);
                const relativePath = path.relative(basePath, fullPath);
                if (entry.isDirectory()) {
                    const filhos = await this.listarRecursivo(basePath, fullPath);
                    itens.push({
                        nome: entry.name,
                        caminho: relativePath,
                        tipo: 'pasta',
                        filhos: filhos,
                        selecionado: false,
                        expandido: false
                    });
                }
                else if (this.isArquivoTexto(entry.name)) {
                    itens.push({
                        nome: entry.name,
                        caminho: relativePath,
                        tipo: 'arquivo',
                        selecionado: false
                    });
                }
            }
        }
        catch (error) {
            console.error('Erro ao listar:', error);
        }
        return itens;
    }
    async processarSelecionados(selecionados) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return { arquivos: 0, linhas: 0 };
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;
        let totalArquivos = 0;
        let totalLinhasRemovidas = 0;
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Ajustando linhas vazias...",
            cancellable: false
        }, async (progress) => {
            for (const item of selecionados) {
                if (item.selecionado) {
                    const fullPath = path.join(workspacePath, item.caminho);
                    if (item.tipo === 'pasta') {
                        const resultado = await this.processarPasta(fullPath);
                        totalArquivos += resultado.arquivos;
                        totalLinhasRemovidas += resultado.linhas;
                    }
                    else {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            totalArquivos++;
                            totalLinhasRemovidas += resultado.linhasRemovidas;
                        }
                    }
                    progress.report({ message: `Processados: ${totalArquivos} arquivos` });
                }
            }
        });
        return { arquivos: totalArquivos, linhas: totalLinhasRemovidas };
    }
    async processarPasta(pastaPath) {
        let arquivos = 0;
        let linhas = 0;
        const processarRecursivo = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await processarRecursivo(fullPath);
                    }
                    else if (this.isArquivoTexto(entry.name)) {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            arquivos++;
                            linhas += resultado.linhasRemovidas;
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro ao processar pasta:', error);
            }
        };
        await processarRecursivo(pastaPath);
        return { arquivos, linhas };
    }
    async processarArquivo(filePath) {
        try {
            const conteudo = await fs.promises.readFile(filePath, 'utf-8');
            const linhas = conteudo.split('\n');
            const novasLinhas = [];
            let linhasRemovidas = 0;
            let i = 0;
            while (i < linhas.length) {
                const linhaAtual = linhas[i];
                const linhaVazia = linhaAtual.trim() === '';
                if (!linhaVazia) {
                    novasLinhas.push(linhaAtual);
                    i++;
                    continue;
                }
                let countVazias = 0;
                let j = i;
                while (j < linhas.length && linhas[j].trim() === '') {
                    countVazias++;
                    j++;
                }
                if (countVazias >= 1) {
                    novasLinhas.push('');
                    linhasRemovidas += (countVazias - 1);
                }
                i = j;
            }
            while (novasLinhas.length > 0 && novasLinhas[novasLinhas.length - 1].trim() === '') {
                novasLinhas.pop();
                linhasRemovidas++;
            }
            const novoConteudo = novasLinhas.join('\n');
            if (linhasRemovidas > 0) {
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
            }
            return { linhasRemovidas };
        }
        catch (error) {
            console.error(`Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }
    isArquivoTexto(nome) {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        return extensoes.some(ext => nome.toLowerCase().endsWith(ext));
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Ajustar Linhas</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
        }
        h2 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 20px; }
        .info-box {
            background: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-left: 4px solid var(--vscode-textLink-foreground);
            margin-bottom: 20px;
        }
        .btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn:hover { background: var(--vscode-button-hoverBackground); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        #resultado {
            margin-top: 20px;
            padding: 15px;
            background: var(--vscode-input-background);
            border-radius: 4px;
            display: none;
        }
        #resultado.show { display: block; }
    </style>
</head>
<body>
    <h2>🪄 Ajustar Linhas Vazias</h2>
    <div class="info-box">
        <p><strong>O que faz:</strong> Remove linhas vazias excedentes, mantendo apenas 1 linha entre blocos de código.</p>
        <p><strong>Arquivos suportados:</strong> .js, .ts, .jsx, .tsx, .html, .css, .scss, .json, .md, .txt, .py, .java, .cpp, .c, .php, .xml, .yaml, .yml</p>
    </div>
    <div id="arvore">📄 Carregando estrutura de pastas...</div>
    <button id="btnIniciar" class="btn" onclick="iniciarProcessamento()">Iniciar Processamento</button>
    <div id="resultado"></div>
    <script>
        const vscode = acquireVsCodeApi();
        let estrutura = [];

        window.addEventListener('load', () => {
            vscode.postMessage({ command: 'getPastas' });
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'pastas') {
                estrutura = message.pastas;
                renderizarArvore();
            } else if (message.command === 'processamentoConcluido') {
                const resultado = document.getElementById('resultado');
                resultado.innerHTML = \`
                    <strong>✅ Processamento Concluído!</strong><br>
                    📊 \${message.resultado.arquivos} arquivo(s) processado(s)<br>
                    🗑️ \${message.resultado.linhas} linha(s) vazia(s) removida(s)
                \`;
                resultado.classList.add('show');
                document.getElementById('btnIniciar').disabled = false;
            }
        });

        function renderizarArvore() {
            const total = countTotal(estrutura);
            document.getElementById('arvore').innerHTML = \`
                <p><strong>✅ Estrutura carregada!</strong></p>
                <p>Total de arquivos encontrados: \${total}</p>
            \`;
        }

        function countTotal(items) {
            let count = 0;
            items.forEach(item => {
                if (item.tipo === 'arquivo') count++;
                if (item.filhos) count += countTotal(item.filhos);
            });
            return count;
        }

        function iniciarProcessamento() {
            const btn = document.getElementById('btnIniciar');
            btn.disabled = true;
            btn.textContent = 'Processando...';
            
            // Marca todos como selecionados para processar tudo
            marcarTodos(estrutura);
            
            vscode.postMessage({ 
                command: 'iniciarProcessamento', 
                selecionados: estrutura 
            });
        }

        function marcarTodos(items) {
            items.forEach(item => {
                item.selecionado = true;
                if (item.filhos) marcarTodos(item.filhos);
            });
        }
    </script>
</body>
</html>`;
    }
}
exports.AjustarLinhasTool = AjustarLinhasTool;
//# sourceMappingURL=ajustar-linhas.js.map