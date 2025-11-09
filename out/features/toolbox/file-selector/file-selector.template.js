"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSelectorTemplate = void 0;
const file_selector_styles_1 = require("./file-selector.styles");
const file_selector_script_1 = require("./file-selector.script");
/**
 * Template para interface de seleção de arquivos
 * Reutilizável por todas as file tools
 *
 * Responsabilidade: Gerar HTML da UI de seleção de arquivos com árvore hierárquica
 */
class FileSelectorTemplate {
    constructor() {
        this.styles = new file_selector_styles_1.FileSelectorStyles();
        this.script = new file_selector_script_1.FileSelectorScript();
    }
    /**
     * Gera o HTML completo da interface de seleção
     * @param config Configuração da tool
     * @param files Estrutura de arquivos (opcional, será carregada via mensagem)
     */
    getHTML(config, files) {
        return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; script-src 'unsafe-inline';">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vscode/codicons@latest/dist/codicon.css">
    <title>${config.title}</title>
    <style>
        ${this.styles.getStyles()}
    </style>
</head>
<body>
    ${this.renderHeader(config)}
    ${this.renderInfoBox(config)}
    ${this.renderWarningBox(config)}
    ${this.renderActionButtons(config)}
    ${this.renderFileExplorer()}
    ${this.renderStatistics()}
    ${this.renderExecuteButton(config)}
    ${this.renderResults()}

    <script>
        ${this.script.getScript()}
    </script>
</body>
</html>`;
    }
    /**
     * Renderiza o cabeçalho
     */
    renderHeader(config) {
        return `
        <header class="header">
            <h1 class="header-title">
                <i class="codicon codicon-${config.icon}"></i>
                ${config.title}
            </h1>
            <p class="header-description">${config.description}</p>
        </header>`;
    }
    /**
     * Renderiza a info box (se configurada)
     */
    renderInfoBox(config) {
        if (!config.infoBoxMessage && !config.infoBoxExample) {
            return '';
        }
        return `
        <div class="info-box">
            <i class="codicon codicon-info info-icon"></i>
            <div class="info-content">
                ${config.infoBoxMessage ? `<p><strong>Como funciona:</strong> ${config.infoBoxMessage}</p>` : ''}
                ${config.infoBoxExample ? `
                    <div class="info-example">
                        <strong>Exemplo:</strong>
                        <pre>${this.escapeHtml(config.infoBoxExample)}</pre>
                    </div>
                ` : ''}
            </div>
        </div>`;
    }
    /**
     * Renderiza a warning box (se configurada)
     */
    renderWarningBox(config) {
        if (!config.warningMessage && !config.confirmMessage) {
            return '';
        }
        const message = config.warningMessage || config.confirmMessage;
        return `
        <div class="warning-box">
            <i class="codicon codicon-warning warning-icon"></i>
            <div class="warning-content">
                <strong>Atenção:</strong> ${message}
            </div>
        </div>`;
    }
    /**
     * Renderiza os botões de ação
     */
    renderActionButtons(config) {
        return `
        <div class="action-buttons">
            <button id="selectAllBtn" class="btn btn-secondary">
                <i class="codicon codicon-check-all"></i>
                Selecionar Tudo
            </button>
            <button id="deselectAllBtn" class="btn btn-secondary">
                <i class="codicon codicon-close-all"></i>
                Desmarcar Tudo
            </button>
            <button id="expandAllBtn" class="btn btn-secondary">
                <i class="codicon codicon-expand-all"></i>
                Expandir Tudo
            </button>
            <button id="collapseAllBtn" class="btn btn-secondary">
                <i class="codicon codicon-collapse-all"></i>
                Colapsar Tudo
            </button>
            <button id="refreshBtn" class="btn btn-secondary">
                <i class="codicon codicon-refresh"></i>
                Atualizar
            </button>
        </div>`;
    }
    /**
     * Renderiza o explorador de arquivos
     */
    renderFileExplorer() {
        return `
        <div class="file-explorer" id="fileExplorer">
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Carregando estrutura de arquivos...</p>
            </div>
        </div>`;
    }
    /**
     * Renderiza as estatísticas
     */
    renderStatistics() {
        return `
        <div class="statistics">
            <strong>📊 Estatísticas:</strong>
            <div id="statistics">0 arquivo(s) selecionado(s)</div>
        </div>`;
    }
    /**
     * Renderiza o botão de executar
     */
    renderExecuteButton(config) {
        return `
        <button id="executeBtn" class="btn btn-primary" disabled>
            <i class="codicon codicon-${config.buttonIcon}"></i>
            ${config.buttonText}
        </button>`;
    }
    /**
     * Renderiza a área de resultados
     */
    renderResults() {
        return `
        <div id="results" class="results">
            <div id="resultContent"></div>
        </div>`;
    }
    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
exports.FileSelectorTemplate = FileSelectorTemplate;
//# sourceMappingURL=file-selector.template.js.map