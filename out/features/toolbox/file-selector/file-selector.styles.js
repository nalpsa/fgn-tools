"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSelectorStyles = void 0;
/**
 * Estilos CSS para o seletor de arquivos
 * Reutilizável por todas as file tools
 */
class FileSelectorStyles {
    /**
     * Retorna todos os estilos CSS
     */
    getStyles() {
        return `
        ${this.getBaseStyles()}
        ${this.getHeaderStyles()}
        ${this.getInfoBoxStyles()}
        ${this.getWarningBoxStyles()}
        ${this.getButtonStyles()}
        ${this.getFileExplorerStyles()}
        ${this.getStatisticsStyles()}
        ${this.getResultsStyles()}
        ${this.getLoadingStyles()}
        ${this.getAnimationStyles()}
        `;
    }
    getBaseStyles() {
        return `
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
        `;
    }
    getHeaderStyles() {
        return `
        .header {
            margin-bottom: 20px;
        }

        .header-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--vscode-titleBar-activeForeground);
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        }

        .header-title i {
            font-size: 1.6rem;
        }

        .header-description {
            color: var(--vscode-descriptionForeground);
            font-size: 0.95rem;
        }
        `;
    }
    getInfoBoxStyles() {
        return `
        .info-box {
            background: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-charts-blue);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            display: flex;
            gap: 12px;
        }

        .info-icon {
            color: var(--vscode-charts-blue);
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .info-content {
            flex: 1;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .info-example {
            margin-top: 10px;
            padding: 10px;
            background: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
        }

        .info-example pre {
            margin-top: 5px;
            font-size: 0.85rem;
            color: var(--vscode-textPreformat-foreground);
            white-space: pre-wrap;
        }
        `;
    }
    getWarningBoxStyles() {
        return `
        .warning-box {
            background: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .warning-icon {
            color: var(--vscode-inputValidation-warningForeground);
            font-size: 20px;
            flex-shrink: 0;
        }

        .warning-content {
            flex: 1;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        `;
    }
    getButtonStyles() {
        return `
        .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }

        .btn {
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

        .btn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
        }

        .btn:active:not(:disabled) {
            transform: translateY(1px);
        }

        .btn:disabled {
            background: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
            opacity: 0.6;
        }

        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover:not(:disabled) {
            background: var(--vscode-button-secondaryHoverBackground);
        }

        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            font-weight: 600;
            padding: 10px 20px;
            font-size: 14px;
        }

        .btn i {
            font-size: 14px;
        }
        `;
    }
    getFileExplorerStyles() {
        return `
        .file-explorer {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            min-height: 300px;
            max-height: 500px;
            overflow-y: auto;
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

        .expand-icon {
            margin-right: 5px;
            cursor: pointer;
            width: 16px;
            height: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }

        .expand-icon i {
            font-size: 12px;
        }

        .file-checkbox {
            margin-right: 10px;
            cursor: pointer;
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
            min-width: 0;
        }

        .file-name {
            color: var(--vscode-foreground);
            font-weight: 500;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-path {
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .folder-children {
            margin-left: 30px;
        }

        .folder-children.collapsed {
            display: none;
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
        `;
    }
    getStatisticsStyles() {
        return `
        .statistics {
            margin: 15px 0;
            padding: 12px;
            background: var(--vscode-textBlockQuote-background);
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .statistics strong {
            margin-right: 8px;
        }
        `;
    }
    getResultsStyles() {
        return `
        .results {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            display: none;
        }

        .results.show {
            display: block;
        }

        .results.success {
            background: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
        }

        .results.error {
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
        }

        .results i {
            margin-right: 8px;
        }

        .results p {
            margin: 8px 0;
        }

        .results strong {
            font-weight: 600;
        }
        `;
    }
    getLoadingStyles() {
        return `
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
        `;
    }
    getAnimationStyles() {
        return `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .file-item {
            animation: fadeIn 0.2s ease-out;
        }
        `;
    }
}
exports.FileSelectorStyles = FileSelectorStyles;
//# sourceMappingURL=file-selector.styles.js.map