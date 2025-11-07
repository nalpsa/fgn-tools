import * as vscode from 'vscode';
import { ITool, ToolCategory, ToolResult } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para analisar texto e fornecer estatísticas detalhadas
 * Conta caracteres, palavras, linhas, e fornece métricas adicionais
 */
export class ContadorTextoTool implements ITool {
    public readonly id = 'contador-texto';
    public readonly name = 'Contador de Texto';
    public readonly description = 'Analisa texto e fornece estatísticas: caracteres, palavras, linhas';
    public readonly icon = '📊';
    public readonly category = ToolCategory.TEXT;

    private panel: vscode.WebviewPanel | undefined;

    async execute(input: any): Promise<ToolResult> {
        try {
            let text = '';
            
            if (input && input.text) {
                // Se o texto foi fornecido diretamente no input
                text = input.text;
            } else {
                // Tentar pegar do editor ativo
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    text = editor.document.getText();
                } else {
                    // Abrir a UI se não há texto disponível
                    this.openUI();
                    return {
                        success: true,
                        output: 'UI aberta para análise de texto'
                    };
                }
            }
            
            const stats = this.analyzeText(text);
            
            return {
                success: true,
                output: stats,
                stats: {
                    charactersProcessed: text.length
                }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
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
            'contadorTexto',
            '📊 Contador de Texto',
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
                case 'analyze':
                    const stats = this.analyzeText(message.text);
                    this.panel?.webview.postMessage({
                        command: 'stats',
                        stats
                    });
                    break;
            }
        });
    }

    private analyzeText(text: string): any {
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.split('\n').length;
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        
        // Tempo estimado de leitura (baseado em 200 palavras por minuto)
        const readingTime = Math.ceil(words / 200);
        
        // Tempo estimado de fala (baseado em 150 palavras por minuto)
        const speakingTime = Math.ceil(words / 150);

        return {
            chars,
            charsNoSpaces,
            words,
            lines,
            paragraphs,
            sentences,
            readingTime,
            speakingTime,
            avgWordLength: words > 0 ? (charsNoSpaces / words).toFixed(2) : 0,
            avgSentenceLength: sentences > 0 ? (words / sentences).toFixed(2) : 0
        };
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Contador de Texto</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
        }
        h2 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 20px; }
        .container { max-width: 900px; }
        textarea {
            width: 100%;
            min-height: 200px;
            padding: 15px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            resize: vertical;
            font-size: 14px;
            line-height: 1.6;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .stat-card {
            background: var(--vscode-sideBar-background);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--vscode-textLink-foreground);
            transition: transform 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .stat-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .stat-unit {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
            margin-left: 4px;
        }
        .info-section {
            background: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-left: 4px solid var(--vscode-charts-blue);
            margin-top: 20px;
            border-radius: 4px;
        }
        .info-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-widget-border);
        }
        .info-item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>📊 Contador de Texto</h2>
        
        <textarea id="inputText" placeholder="Digite ou cole seu texto aqui para análise instantânea...">Digite seu texto aqui para ver as estatísticas em tempo real.</textarea>

        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <div class="stat-label">Caracteres</div>
                <div class="stat-value" id="chars">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Caracteres (sem espaços)</div>
                <div class="stat-value" id="charsNoSpaces">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Palavras</div>
                <div class="stat-value" id="words">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Linhas</div>
                <div class="stat-value" id="lines">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Parágrafos</div>
                <div class="stat-value" id="paragraphs">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Sentenças</div>
                <div class="stat-value" id="sentences">0</div>
            </div>
        </div>

        <div class="info-section">
            <div class="info-title">📖 Estatísticas de Leitura</div>
            <div class="info-item">
                <span>Tempo de leitura estimado:</span>
                <strong><span id="readingTime">0</span> minuto(s)</strong>
            </div>
            <div class="info-item">
                <span>Tempo de fala estimado:</span>
                <strong><span id="speakingTime">0</span> minuto(s)</strong>
            </div>
            <div class="info-item">
                <span>Comprimento médio de palavra:</span>
                <strong><span id="avgWordLength">0</span> caracteres</strong>
            </div>
            <div class="info-item">
                <span>Palavras por sentença (média):</span>
                <strong><span id="avgSentenceLength">0</span> palavras</strong>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const textarea = document.getElementById('inputText');

        // Analisa o texto inicial
        analyzeText();

        // Analisa o texto em tempo real
        textarea.addEventListener('input', () => {
            analyzeText();
        });

        function analyzeText() {
            const text = textarea.value;
            vscode.postMessage({
                command: 'analyze',
                text: text
            });
        }

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'stats') {
                updateStats(message.stats);
            }
        });

        function updateStats(stats) {
            document.getElementById('chars').textContent = stats.chars;
            document.getElementById('charsNoSpaces').textContent = stats.charsNoSpaces;
            document.getElementById('words').textContent = stats.words;
            document.getElementById('lines').textContent = stats.lines;
            document.getElementById('paragraphs').textContent = stats.paragraphs;
            document.getElementById('sentences').textContent = stats.sentences;
            document.getElementById('readingTime').textContent = stats.readingTime;
            document.getElementById('speakingTime').textContent = stats.speakingTime;
            document.getElementById('avgWordLength').textContent = stats.avgWordLength;
            document.getElementById('avgSentenceLength').textContent = stats.avgSentenceLength;
        }
    </script>
</body>
</html>`;
    }
}