/**
 * Interface base para todas as ferramentas da extensão
 * Seguindo o Princípio da Segregação de Interface (ISP) do SOLID
 */
export interface ITool {
    /**
     * Identificador único da ferramenta
     */
    readonly id: string;

    /**
     * Nome amigável da ferramenta
     */
    readonly name: string;

    /**
     * Descrição breve da funcionalidade
     */
    readonly description: string;

    /**
     * Ícone da ferramenta (usando VS Code Codicons)
     * @see https://microsoft.github.io/vscode-codicons/dist/codicon.html
     */
    readonly icon: string;

    /**
     * Categoria da ferramenta
     */
    readonly category: ToolCategory;

    /**
     * Ativa e executa a ferramenta
     * Princípio da Responsabilidade Única (SRP): cada ferramenta gerencia sua própria ativação
     */
    activate(): Promise<void>;
}

/**
 * Categorias disponíveis para organização das ferramentas
 */
export enum ToolCategory {
    CODE = 'code-tools',
    TEXT = 'text-tools',
    FILE = 'file-tools',
    FORMATTERS = 'formatters',
    OTHER = 'other-tools'
}

/**
 * Metadados de categoria para exibição no dashboard
 */
export interface ICategoryMetadata {
    id: ToolCategory;
    name: string;
    icon: string;
    description: string;
}