/**
 * Interface base para todas as ferramentas da extensÃ£o
 * Seguindo o PrincÃ­pio da SegregaÃ§Ã£o de Interface (ISP) do SOLID
 */
export interface ITool {
    /**
     * Identificador Ãºnico da ferramenta
     */
    readonly id: string;

    /**
     * Nome amigÃ¡vel da ferramenta
     */
    readonly name: string;

    /**
     * DescriÃ§Ã£o breve da funcionalidade
     */
    readonly description: string;

    /**
     * Ãcone da ferramenta (emoji ou VS Code Codicon name)
     * Exemplos: 'ðŸª„', 'ðŸ—‘ï¸', 'wand', 'trash'
     */
    readonly icon: string;

    /**
     * Categoria da ferramenta
     */
    readonly category: ToolCategory;

    /**
     * Executa a ferramenta com os dados fornecidos
     * @param input Dados de entrada (pode variar por tool)
     * @returns Resultado da execuÃ§Ã£o
     */
    execute(input: any): Promise<ToolResult>;
}

/**
 * Resultado da execuÃ§Ã£o de uma ferramenta
 */
export interface ToolResult {
    /**
     * Indica se a execuÃ§Ã£o foi bem-sucedida
     */
    success: boolean;

    /**
     * Dados de saÃ­da (opcional)
     */
    output?: any;

    /**
     * Mensagem de erro (se success = false)
     */
    error?: string;

    /**
     * EstatÃ­sticas da execuÃ§Ã£o (opcional)
     */
    stats?: ToolStats;
}

/**
 * EstatÃ­sticas de execuÃ§Ã£o de uma ferramenta
 */
export interface ToolStats {
    /**
     * NÃºmero de arquivos processados
     */
    filesProcessed?: number;

    /**
     * NÃºmero de linhas alteradas
     */
    linesChanged?: number;

    /**
     * NÃºmero de caracteres processados
     */
    charactersProcessed?: number;

    /**
     * Tempo de execuÃ§Ã£o em milissegundos
     */
    executionTimeMs?: number;

    /**
     * EstatÃ­sticas customizadas adicionais
     */
    [key: string]: any;
}

/**
 * Categorias disponÃ­veis para organizaÃ§Ã£o das ferramentas
 */
export enum ToolCategory {
    CODE = 'code',
    TEXT = 'text',
    FILE = 'file',
    FORMAT = 'format',
    OTHER = 'other'
}

/**
 * Metadados de categoria para exibiÃ§Ã£o no dashboard
 */
export interface ICategoryMetadata {
    /**
     * ID da categoria (mesmo valor do enum)
     */
    id: ToolCategory;

    /**
     * Nome formatado para exibiÃ§Ã£o
     */
    name: string;

    /**
     * Ãcone da categoria (emoji ou codicon)
     */
    icon: string;

    /**
     * DescriÃ§Ã£o da categoria
     */
    description: string;
}

/**
 * ConfiguraÃ§Ã£o de uma ferramenta para UI
 */
export interface ToolConfig {
    /**
     * Ãcone principal (VS Code Codicon name)
     * Exemplos: 'wand', 'trash', 'comment', 'symbol-color'
     */
    icon: string;

    /**
     * TÃ­tulo da janela/modal
     */
    title: string;

    /**
     * DescriÃ§Ã£o detalhada da ferramenta
     */
    description: string;

    /**
     * Mensagem de confirmaÃ§Ã£o antes de executar
     */
    confirmMessage: string;

    /**
     * Mensagem de sucesso apÃ³s execuÃ§Ã£o
     */
    successMessage: string;

    /**
     * Mensagem de erro padrÃ£o
     */
    errorMessage: string;

    /**
     * Texto do botÃ£o de execuÃ§Ã£o
     */
    buttonText: string;

    /**
     * Ãcone do botÃ£o de execuÃ§Ã£o
     */
    buttonIcon: string;

    /**
    /**
     * Extensões de arquivo suportadas (opcional)
     * Se não especificado, aceita todos arquivos texto
     * Exemplo: ['.js', '.ts', '.jsx', '.tsx']
     */
    fileExtensions?: string[];

    /**
     * Box informativo (opcional)
     */
    infoBox?: {
        title: string;
        content: string;
    };

    /**
     * Box de aviso (opcional)
     */
    warningBox?: {
        title: string;
        content: string;
    };

    /**
     * Mensagem adicional para info box (opcional)
     * @deprecated Use infoBox ao invés
     */
    infoBoxMessage?: string;

    /**
     * Exemplo visual para info box (opcional)
     * @deprecated Use infoBox.content ao invés
     */
    infoBoxExample?: string;

    /**
     * Mensagem de aviso adicional (opcional)
     * @deprecated Use warningBox ao invés
     */
    warningMessage?: string;
}