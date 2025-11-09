/**
 * Estilos CSS para o dashboard
 * Seguindo o SRP - apenas responsável por CSS do dashboard
 */
export class DashboardStyles {
    
    /**
     * Retorna todos os estilos CSS do dashboard
     */
    public getStyles(): string {
        return `
        ${this.getBaseStyles()}
        ${this.getHeaderStyles()}
        ${this.getCategoryStyles()}
        ${this.getToolCardStyles()}
        ${this.getEmptyStateStyles()}
        ${this.getAnimationStyles()}
        ${this.getResponsiveStyles()}
        `;
    }

    /**
     * Estilos base
     */
    private getBaseStyles(): string {
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
            padding: 0;
            margin: 0;
            overflow-x: hidden;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        `;
    }

    /**
     * Estilos do cabeçalho
     */
    private getHeaderStyles(): string {
        return `
        .dashboard-header {
            background: var(--vscode-sideBar-background);
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-bottom: 3px solid var(--vscode-textLink-foreground);
        }

        .header-content {
            max-width: 800px;
            margin: 0 auto;
        }

        .dashboard-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }

        .title-icon {
            font-size: 2.5rem;
            animation: pulse 2s ease-in-out infinite;
        }

        .dashboard-subtitle {
            font-size: 1.1rem;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 15px;
        }

        .tools-count {
            display: inline-block;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }
        `;
    }

    /**
     * Estilos das categorias
     */
    private getCategoryStyles(): string {
        return `
        .tools-grid {
            display: flex;
            flex-direction: column;
            gap: 50px;
        }

        .category-section {
            animation: fadeInUp 0.5s ease-out;
        }

        .category-header {
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--vscode-widget-border);
        }

        .category-title {
            font-size: 1.6rem;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--vscode-foreground);
        }

        .category-icon {
            font-size: 1.8rem;
        }

        .category-description {
            color: var(--vscode-descriptionForeground);
            font-size: 0.95rem;
            margin-left: 42px;
        }

        .tools-row {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
        `;
    }

    /**
     * Estilos dos cards de ferramentas
     */
    private getToolCardStyles(): string {
        return `
        .tool-card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 10px;
            padding: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            position: relative;
            overflow: hidden;
        }

        .tool-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--vscode-textLink-foreground);
            transform: scaleY(0);
            transition: transform 0.3s ease;
        }

        .tool-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            border-color: var(--vscode-textLink-foreground);
        }

        .tool-card:hover::before {
            transform: scaleY(1);
        }

        .tool-card:active {
            transform: translateY(-2px);
        }

        .tool-icon {
            flex-shrink: 0;
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vscode-button-background);
            border-radius: 10px;
            font-size: 28px;
            transition: all 0.3s ease;
        }

        .tool-card:hover .tool-icon {
            background: var(--vscode-button-hoverBackground);
            transform: scale(1.1) rotate(5deg);
        }

        .tool-info {
            flex: 1;
            min-width: 0;
        }

        .tool-name {
            font-size: 1.15rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }

        .tool-description {
            font-size: 0.9rem;
            color: var(--vscode-descriptionForeground);
            line-height: 1.5;
        }

        .tool-action {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            opacity: 0.4;
            transition: all 0.3s ease;
        }

        .tool-card:hover .tool-action {
            opacity: 1;
            transform: translateX(6px);
        }

        .action-arrow {
            font-size: 24px;
            color: var(--vscode-textLink-foreground);
            font-weight: bold;
        }
        `;
    }

    /**
     * Estilos do estado vazio
     */
    private getEmptyStateStyles(): string {
        return `
        .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-icon {
            font-size: 5rem;
            margin-bottom: 20px;
            opacity: 0.5;
            animation: bounce 2s ease-in-out infinite;
        }

        .empty-state h2 {
            font-size: 1.8rem;
            margin-bottom: 12px;
            color: var(--vscode-foreground);
        }

        .empty-state p {
            font-size: 1rem;
            max-width: 500px;
            margin: 0 auto;
        }
        `;
    }

    /**
     * Animações
     */
    private getAnimationStyles(): string {
        return `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }

        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-20px);
            }
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        `;
    }

    /**
     * Estilos responsivos
     */
    private getResponsiveStyles(): string {
        return `
        @media (max-width: 1200px) {
            .tools-row {
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 15px;
            }

            .dashboard-header {
                padding: 30px 20px;
            }

            .dashboard-title {
                font-size: 2rem;
                flex-direction: column;
                gap: 10px;
            }

            .tools-row {
                grid-template-columns: 1fr;
            }

            .category-title {
                font-size: 1.4rem;
            }

            .category-description {
                margin-left: 0;
                margin-top: 8px;
            }
        }

        @media (max-width: 480px) {
            .dashboard-title {
                font-size: 1.6rem;
            }

            .tool-card {
                padding: 18px;
            }

            .tool-icon {
                width: 44px;
                height: 44px;
                font-size: 24px;
            }
        }
        `;
    }

    /**
     * Estilos para scrollbar customizada
     */
    public getScrollbarStyles(): string {
        return `
        ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }

        ::-webkit-scrollbar-track {
            background: var(--vscode-editor-background);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }
        `;
    }
}