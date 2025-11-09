import * as vscode from 'vscode';

/**
 * Interface para provedor de workspace
 * Abstrai operações do VS Code Workspace API seguindo o DIP (Dependency Inversion Principle)
 */
export interface IWorkspaceProvider {
    /**
     * Retorna as pastas do workspace
     */
    getWorkspaceFolders(): vscode.WorkspaceFolder[] | undefined;

    /**
     * Busca arquivos no workspace
     * @param include Padrão glob de inclusão
     * @param exclude Padrão glob de exclusão
     */
    findFiles(include: string, exclude?: string): Promise<vscode.Uri[]>;

    /**
     * Retorna o caminho relativo de um arquivo em relação ao workspace
     * @param pathOrUri Caminho ou URI do arquivo
     */
    asRelativePath(pathOrUri: string | vscode.Uri): string;

    /**
     * Verifica se há workspace aberto
     */
    hasWorkspace(): boolean;

    /**
     * Retorna o nome do workspace
     */
    getWorkspaceName(): string | undefined;

    /**
     * Retorna o caminho raiz do workspace
     */
    getWorkspaceRoot(): string | undefined;
}

/**
 * Estrutura de arquivo/pasta para visualização em árvore
 */
export interface WorkspaceFileStructure {
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
     * Se está selecionado (para UI)
     */
    selected: boolean;

    /**
     * Filhos (se for pasta)
     */
    children?: WorkspaceFileStructure[];

    /**
     * Se está expandido (se for pasta)
     */
    expanded?: boolean;
}

/**
 * Opções para busca de arquivos no workspace
 */
export interface WorkspaceSearchOptions {
    /**
     * Padrões de inclusão (glob patterns)
     * Exemplo: '**\/*.ts'
     */
    includePatterns?: string[];

    /**
     * Padrões de exclusão (glob patterns)
     * Exemplo: ['**\/node_modules/**', '**\/.git/**']
     */
    excludePatterns?: string[];

    /**
     * Extensões permitidas
     * Exemplo: ['.js', '.ts', '.jsx', '.tsx']
     */
    allowedExtensions?: string[];
    
    includeExtensions?: string[];
    /**
     * Limite máximo de arquivos retornados
     */
    maxFiles?: number;

    /**
     * Incluir arquivos ocultos (começam com .)
     */
    includeHidden?: boolean;
}

/**
 * Padrões de exclusão padrão
 */
export const DEFAULT_EXCLUDE_PATTERNS = [
    '**/node_modules/**',
    '**/.git/**',
    '**/out/**',
    '**/dist/**',
    '**/build/**',
    '**/.vscode/**',
    '**/venv/**',
    '**/.venv/**',
    '**/__pycache__/**',
    '**/target/**',
    '**/.idea/**',
    '**/.DS_Store'
];

/**
 * Extensões de arquivo texto suportadas por padrão
 */
export const DEFAULT_TEXT_EXTENSIONS = [
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.json',
    '.md',
    '.txt',
    '.py',
    '.java',
    '.cpp',
    '.c',
    '.h',
    '.hpp',
    '.cs',
    '.php',
    '.rb',
    '.go',
    '.rs',
    '.swift',
    '.kt',
    '.xml',
    '.yaml',
    '.yml',
    '.toml',
    '.ini',
    '.cfg',
    '.conf',
    '.sh',
    '.bash',
    '.zsh',
    '.fish',
    '.sql',
    '.vue',
    '.svelte'
];