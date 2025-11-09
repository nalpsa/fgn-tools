import * as vscode from 'vscode';
import * as path from 'path';
import { 
    IWorkspaceProvider, 
    WorkspaceFileStructure, 
    WorkspaceSearchOptions,
    DEFAULT_EXCLUDE_PATTERNS,
    DEFAULT_TEXT_EXTENSIONS
} from '../interfaces/workspace-provider.interface';
import { FileSystemService } from './file-system.service';

/**
 * Serviço para interações com o workspace do VS Code
 * Implementa IWorkspaceProvider seguindo o DIP (Dependency Inversion Principle)
 * 
 * Responsabilidade: APENAS operações de workspace
 * - Buscar arquivos
 * - Obter informações do workspace
 * - Organizar estrutura de arquivos
 */
export class WorkspaceService implements IWorkspaceProvider {
    private static instance: WorkspaceService;
    private fileSystemService: FileSystemService;

    private constructor() {
        this.fileSystemService = FileSystemService.getInstance();
    }

    /**
     * Singleton pattern
     */
    public static getInstance(): WorkspaceService {
        if (!WorkspaceService.instance) {
            WorkspaceService.instance = new WorkspaceService();
        }
        return WorkspaceService.instance;
    }

    /**
     * Retorna as pastas do workspace
     * Converte readonly para array mutável para compatibilidade com interface
     */
    public getWorkspaceFolders(): vscode.WorkspaceFolder[] | undefined {
        const folders = vscode.workspace.workspaceFolders;
        return folders ? [...folders] : undefined;
    }

    /**
     * Busca arquivos no workspace
     */
    public async findFiles(include: string, exclude?: string): Promise<vscode.Uri[]> {
        try {
            return await vscode.workspace.findFiles(include, exclude);
        } catch (error) {
            console.error('Erro ao buscar arquivos:', error);
            return [];
        }
    }

    /**
     * Retorna o caminho relativo de um arquivo
     */
    public asRelativePath(pathOrUri: string | vscode.Uri): string {
        return vscode.workspace.asRelativePath(pathOrUri);
    }

    /**
     * Verifica se há workspace aberto
     */
    public hasWorkspace(): boolean {
        const folders = this.getWorkspaceFolders();
        return folders !== undefined && folders.length > 0;
    }

    /**
     * Retorna o nome do workspace
     */
    public getWorkspaceName(): string | undefined {
        const folders = this.getWorkspaceFolders();
        return folders && folders.length > 0 ? folders[0].name : undefined;
    }

    /**
     * Retorna o caminho raiz do workspace
     */
    public getWorkspaceRoot(): string | undefined {
        const folders = this.getWorkspaceFolders();
        return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
    }

    /**
     * Busca arquivos com opções avançadas
     */
    public async searchFiles(options?: WorkspaceSearchOptions): Promise<vscode.Uri[]> {
        if (!this.hasWorkspace()) {
            return [];
        }

        const includePattern = options?.includePatterns?.join(',') || '**/*';
        const excludePatterns = [
            ...(options?.excludePatterns || []),
            ...DEFAULT_EXCLUDE_PATTERNS
        ];
        const excludePattern = excludePatterns.join(',');

        try {
            const files = await this.findFiles(includePattern, excludePattern);

            // Suporta tanto allowedExtensions quanto includeExtensions (alias)
            const extensions = options?.allowedExtensions || options?.includeExtensions;
            
            // Filtrar por extensões se especificado
            if (extensions && extensions.length > 0) {
                return files.filter(file => 
                    this.hasAllowedExtension(file.fsPath, extensions)
                );
            }

            // Limitar número de arquivos se especificado
            if (options?.maxFiles && files.length > options.maxFiles) {
                return files.slice(0, options.maxFiles);
            }

            return files;
        } catch (error) {
            console.error('Erro ao buscar arquivos com opções:', error);
            return [];
        }
    }

    /**
     * Obtém arquivos de texto do workspace organizados em estrutura de árvore
     */
    public async getWorkspaceFilesStructure(
        options?: WorkspaceSearchOptions
    ): Promise<WorkspaceFileStructure[]> {
        if (!this.hasWorkspace()) {
            return [];
        }

        const workspaceRoot = this.getWorkspaceRoot()!;
        const workspaceName = this.getWorkspaceName()!;

        // Suporta tanto allowedExtensions quanto includeExtensions
        const extensions = options?.allowedExtensions || options?.includeExtensions || DEFAULT_TEXT_EXTENSIONS;

        // Buscar arquivos
        const files = await this.searchFiles({
            ...options,
            allowedExtensions: extensions
        });

        console.log(`📊 Total de arquivos encontrados: ${files.length}`);

        // Criar estrutura raiz
        const rootStructure: WorkspaceFileStructure = {
            name: workspaceName,
            path: '.',
            type: 'folder',
            selected: true,
            expanded: false,
            children: []
        };

        // Organizar em estrutura hierárquica
        const structure = this.organizeIntoHierarchy(files, workspaceRoot);

        return [rootStructure, ...structure];
    }

    /**
     * Organiza arquivos em estrutura hierárquica
     */
    private organizeIntoHierarchy(
        files: vscode.Uri[],
        workspaceRoot: string
    ): WorkspaceFileStructure[] {
        const folderMap = new Map<string, WorkspaceFileStructure>();
        const fileStructures: WorkspaceFileStructure[] = [];

        // Processar cada arquivo
        for (const file of files) {
            const relativePath = this.asRelativePath(file);
            const parts = relativePath.split(path.sep);
            
            // Criar estruturas de pasta para o caminho
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                const parentPath = currentPath;
                currentPath = currentPath ? `${currentPath}${path.sep}${part}` : part;

                if (!folderMap.has(currentPath)) {
                    const folderStructure: WorkspaceFileStructure = {
                        name: part,
                        path: currentPath,
                        type: 'folder',
                        selected: true,
                        expanded: false,
                        children: []
                    };
                    folderMap.set(currentPath, folderStructure);
                }
            }

            // Criar estrutura do arquivo
            const fileName = parts[parts.length - 1];
            const fileStructure: WorkspaceFileStructure = {
                name: fileName,
                path: relativePath,
                type: 'file',
                selected: true
            };

            // Adicionar arquivo à pasta pai ou à raiz
            if (parts.length > 1) {
                const parentPath = parts.slice(0, -1).join(path.sep);
                const parentFolder = folderMap.get(parentPath);
                if (parentFolder && parentFolder.children) {
                    parentFolder.children.push(fileStructure);
                }
            } else {
                fileStructures.push(fileStructure);
            }
        }

        // Organizar pastas em hierarquia
        const rootFolders: WorkspaceFileStructure[] = [];
        
        for (const [folderPath, folder] of folderMap.entries()) {
            const parts = folderPath.split(path.sep);
            
            if (parts.length === 1) {
                // Pasta raiz
                rootFolders.push(folder);
            } else {
                // Subpasta - adicionar ao pai
                const parentPath = parts.slice(0, -1).join(path.sep);
                const parent = folderMap.get(parentPath);
                if (parent && parent.children) {
                    parent.children.push(folder);
                }
            }
        }

        // Combinar pastas raiz e arquivos raiz
        return [...rootFolders, ...fileStructures];
    }

    /**
     * Converte estrutura hierárquica em lista plana (para compatibilidade)
     */
    public flattenStructure(structure: WorkspaceFileStructure[]): WorkspaceFileStructure[] {
        const result: WorkspaceFileStructure[] = [];

        const flatten = (items: WorkspaceFileStructure[]) => {
            for (const item of items) {
                result.push({
                    ...item,
                    children: undefined // Remover children para lista plana
                });

                if (item.children && item.children.length > 0) {
                    flatten(item.children);
                }
            }
        };

        flatten(structure);
        return result;
    }

    /**
     * Verifica se um arquivo tem extensão permitida
     */
    private hasAllowedExtension(filePath: string, allowedExtensions: string[]): boolean {
        const ext = path.extname(filePath).toLowerCase();
        return allowedExtensions.some(allowed => ext === allowed.toLowerCase());
    }
}