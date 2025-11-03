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
exports.TransformadorCaseTool = void 0;
const vscode = __importStar(require("vscode"));
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para converter texto entre diferentes casos
 * camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, etc.
 */
class TransformadorCaseTool {
    constructor() {
        this.id = 'transformador-case';
        this.name = 'Transformador de Case';
        this.description = 'Converte texto entre camelCase, snake_case, kebab-case e outros';
        this.icon = 'symbol-text';
        this.category = tool_interface_1.ToolCategory.TEXT;
    }
    async activate() {
        console.log('🎯 Ativando ferramenta: Transformador de Case');
        this.openUI();
    }
    openUI() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel('transformadorCase', '🅰️ Transformador de Case', vscode.ViewColumn.Two, {
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
                case 'transform':
                    const resultado = this.transformText(message.text, message.caseType);
                    this.panel?.webview.postMessage({
                        command: 'resultado',
                        resultado
                    });
                    break;
            }
        });
    }
    transformText(text, caseType) {
        if (!text)
            return '';
        switch (caseType) {
            case 'camelCase':
                return this.toCamelCase(text);
            case 'PascalCase':
                return this.toPascalCase(text);
            case 'snake_case':
                return this.toSnakeCase(text);
            case 'kebab-case':
                return this.toKebabCase(text);
            case 'CONSTANT_CASE':
                return this.toConstantCase(text);
            case 'Title Case':
                return this.toTitleCase(text);
            case 'lower case':
                return text.toLowerCase();
            case 'UPPER CASE':
                return text.toUpperCase();
            default:
                return text;
        }
    }
    toCamelCase(text) {
        return text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');
    }
    toPascalCase(text) {
        return text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');
    }
    toSnakeCase(text) {
        return text
            .replace(/([A-Z])/g, '_$1')
            .replace(/[\s-]+/g, '_')
            .replace(/^_/, '')
            .toLowerCase();
    }
    toKebabCase(text) {
        return text
            .replace(/([A-Z])/g, '-$1')
            .replace(/[\s_]+/g, '-')
            .replace(/^-/, '')
            .toLowerCase();
    }
    toConstantCase(text) {
        return this.toSnakeCase(text).toUpperCase();
    }
    toTitleCase(text) {
        return text.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase());
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Transformador de Case</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
        }
        h2 { color: var(--vscode-titleBar-activeForeground); margin-bottom: 20px; }
        .container { max-width: 800px; }
        .input-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            resize: vertical;
        }
        .case-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 10px;
            margin: 20px 0;
        }
        .case-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-button-border);
            padding: 12px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 13px;
            transition: all 0.2s;
        }
        .case-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
            transform: translateY(-2px);
        }
        .case-btn:active {
            transform: translateY(0);
        }
        .result-box {
            background: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid var(--vscode-textLink-foreground);
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            word-break: break-all;
        }
        .copy-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 4px;
            margin-top: 10px;
        }
        .copy-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .info-box {
            background: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-left: 4px solid var(--vscode-charts-blue);
            margin-bottom: 20px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🅰️ Transformador de Case</h2>
        
        <div class="info-box">
            <strong>Como usar:</strong> Digite ou cole o texto abaixo e clique no tipo de case desejado.
        </div>

        <div class="input-group">
            <label for="inputText">Texto de entrada:</label>
            <textarea id="inputText" placeholder="Digite seu texto aqui...">meu exemplo de texto</textarea>
        </div>

        <div class="case-buttons">
            <button class="case-btn" onclick="transform('camelCase')">
                <strong>camelCase</strong><br>
                <small>meuExemploDeTexto</small>
            </button>
            <button class="case-btn" onclick="transform('PascalCase')">
                <strong>PascalCase</strong><br>
                <small>MeuExemploDeTexto</small>
            </button>
            <button class="case-btn" onclick="transform('snake_case')">
                <strong>snake_case</strong><br>
                <small>meu_exemplo_de_texto</small>
            </button>
            <button class="case-btn" onclick="transform('kebab-case')">
                <strong>kebab-case</strong><br>
                <small>meu-exemplo-de-texto</small>
            </button>
            <button class="case-btn" onclick="transform('CONSTANT_CASE')">
                <strong>CONSTANT_CASE</strong><br>
                <small>MEU_EXEMPLO_DE_TEXTO</small>
            </button>
            <button class="case-btn" onclick="transform('Title Case')">
                <strong>Title Case</strong><br>
                <small>Meu Exemplo De Texto</small>
            </button>
            <button class="case-btn" onclick="transform('lower case')">
                <strong>lower case</strong><br>
                <small>meu exemplo de texto</small>
            </button>
            <button class="case-btn" onclick="transform('UPPER CASE')">
                <strong>UPPER CASE</strong><br>
                <small>MEU EXEMPLO DE TEXTO</small>
            </button>
        </div>

        <div id="resultContainer" style="display: none;">
            <label>Resultado:</label>
            <div class="result-box" id="resultado"></div>
            <button class="copy-btn" onclick="copyToClipboard()">📋 Copiar resultado</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function transform(caseType) {
            const text = document.getElementById('inputText').value;
            vscode.postMessage({
                command: 'transform',
                text: text,
                caseType: caseType
            });
        }

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'resultado') {
                document.getElementById('resultado').textContent = message.resultado;
                document.getElementById('resultContainer').style.display = 'block';
            }
        });

        function copyToClipboard() {
            const texto = document.getElementById('resultado').textContent;
            navigator.clipboard.writeText(texto).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copiado!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }
    </script>
</body>
</html>`;
    }
}
exports.TransformadorCaseTool = TransformadorCaseTool;
//# sourceMappingURL=transformador-case.tool.js.map