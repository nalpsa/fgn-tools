/**
 * Interface para estratégias de processamento de arquivos
 * Seguindo o Strategy Pattern para permitir diferentes algoritmos intercambiáveis
 */
export interface IFileProcessingStrategy {
    /**
     * Processa o conteúdo de um arquivo
     * @param content Conteúdo original do arquivo
     * @returns Resultado do processamento
     */
    processFile(content: string): ProcessResult;

    /**
     * Retorna o nome descritivo da estratégia
     */
    getName(): string;
}

/**
 * Resultado do processamento de um arquivo
 */
export interface ProcessResult {
    /**
     * Conteúdo processado do arquivo
     */
    content: string;

    /**
     * Número de linhas alteradas/removidas/adicionadas
     */
    linesChanged: number;

    /**
     * Metadados adicionais do processamento (opcional)
     */
    metadata?: {
        /**
         * Linhas originais
         */
        originalLines?: number;

        /**
         * Linhas finais
         */
        finalLines?: number;

        /**
         * Caracteres removidos
         */
        charactersRemoved?: number;

        /**
         * Caracteres adicionados
         */
        charactersAdded?: number;

        /**
         * Dados customizados
         */
        [key: string]: any;
    };
}

/**
 * Input para ferramentas que trabalham com seleção de arquivos
 */
export interface FileSelectionInput {
    /**
     * Lista de arquivos/pastas selecionados
     */
    selections: FileSelection[];

    /**
     * Caminho do workspace
     */
    workspacePath: string;
}

/**
 * Representa um arquivo ou pasta selecionado
 */
export interface FileSelection {
    /**
     * Nome do arquivo/pasta
     */
    name: string;

    /**
     * Caminho relativo ao workspace
     */
    path: string;

    /**
     * Tipo: arquivo ou pasta
     */
    type: 'file' | 'folder';

    /**
     * Se está selecionado
     */
    selected: boolean;

    /**
     * Filhos (se for pasta)
     */
    children?: FileSelection[];

    /**
     * Se está expandido (se for pasta)
     */
    expanded?: boolean;
}

/**
 * Informações sobre um arquivo processado
 */
export interface ProcessedFileInfo {
    /**
     * Caminho do arquivo
     */
    path: string;

    /**
     * Nome do arquivo
     */
    name: string;

    /**
     * Se o processamento foi bem-sucedido
     */
    success: boolean;

    /**
     * Resultado do processamento (se success = true)
     */
    result?: ProcessResult;

    /**
     * Mensagem de erro (se success = false)
     */
    error?: string;
}

/**
 * Opções para processamento de arquivos
 */
export interface FileProcessingOptions {
    /**
     * Mostrar progresso durante processamento
     */
    showProgress?: boolean;

    /**
     * Título da barra de progresso
     */
    progressTitle?: string;

    /**
     * Parar na primeira falha
     */
    stopOnError?: boolean;

    /**
     * Fazer backup antes de processar
     */
    createBackup?: boolean;

    /**
     * Extensões de arquivo permitidas
     */
    allowedExtensions?: string[];

    /**
     * Padrões de exclusão (glob patterns)
     */
    excludePatterns?: string[];
}