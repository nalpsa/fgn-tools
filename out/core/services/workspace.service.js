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
exports.WorkspaceService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const workspace_provider_interface_1 = require("../interfaces/workspace-provider.interface");
const file_system_service_1 = require("./file-system.service");
/**
 * Serviço para interações com o workspace do VS Code
 * Implementa IWorkspaceProvider seguindo o DIP (Dependency Inversion Principle)
 *
 * Responsabilidade: APENAS operações de workspace
 * - Buscar arquivos
 * - Obter informações do workspace
 * - Organizar estrutura de arquivos
 */
class WorkspaceService {
    constructor() {
        this.fileSystemService = file_system_service_1.FileSystemService.getInstance();
    }
    /**
     * Singleton pattern
     */
    static getInstance() {
        if (!WorkspaceService.instance) {
            WorkspaceService.instance = new WorkspaceService();
        }
        return WorkspaceService.instance;
    }
    /**
     * Retorna as pastas do workspace
     * Converte readonly para array mutável para compatibilidade com interface
     */
    getWorkspaceFolders() {
        const folders = vscode.workspace.workspaceFolders;
        return folders ? [...folders] : undefined;
    }
    /**
     * Busca arquivos no workspace
     */
    async findFiles(include, exclude) {
        try {
            return await vscode.workspace.findFiles(include, exclude);
        }
        catch (error) {
            console.error('Erro ao buscar arquivos:', error);
            return [];
        }
    }
    /**
     * Retorna o caminho relativo de um arquivo
     */
    asRelativePath(pathOrUri) {
        return vscode.workspace.asRelativePath(pathOrUri);
    }
    /**
     * Verifica se há workspace aberto
     */
    hasWorkspace() {
        const folders = this.getWorkspaceFolders();
        return folders !== undefined && folders.length > 0;
    }
    /**
     * Retorna o nome do workspace
     */
    getWorkspaceName() {
        const folders = this.getWorkspaceFolders();
        return folders && folders.length > 0 ? folders[0].name : undefined;
    }
    /**
     * Retorna o caminho raiz do workspace
     */
    getWorkspaceRoot() {
        const folders = this.getWorkspaceFolders();
        return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
    }
    /**
     * Busca arquivos com opções avançadas
     */
    async searchFiles(options) {
        if (!this.hasWorkspace()) {
            return [];
        }
        const includePattern = options?.includePatterns?.join(',') || '**/*';
        const excludePatterns = [
            ...(options?.excludePatterns || []),
            ...workspace_provider_interface_1.DEFAULT_EXCLUDE_PATTERNS
        ];
        const excludePattern = excludePatterns.join(',');
        try {
            const files = await this.findFiles(includePattern, excludePattern);
            // Suporta tanto allowedExtensions quanto includeExtensions (alias)
            const extensions = options?.allowedExtensions || options?.includeExtensions;
            // Filtrar por extensões se especificado
            if (extensions && extensions.length > 0) {
                return files.filter(file => this.hasAllowedExtension(file.fsPath, extensions));
            }
            // Limitar número de arquivos se especificado
            if (options?.maxFiles && files.length > options.maxFiles) {
                return files.slice(0, options.maxFiles);
            }
            return files;
        }
        catch (error) {
            console.error('Erro ao buscar arquivos com opções:', error);
            return [];
        }
    }
    /**
     * Obtém arquivos de texto do workspace organizados em estrutura de árvore
     */
    async getWorkspaceFilesStructure(options) {
        if (!this.hasWorkspace()) {
            return [];
        }
        const workspaceRoot = this.getWorkspaceRoot();
        const workspaceName = this.getWorkspaceName();
        // Suporta tanto allowedExtensions quanto includeExtensions
        const extensions = options?.allowedExtensions || options?.includeExtensions || workspace_provider_interface_1.DEFAULT_TEXT_EXTENSIONS;
        // Buscar arquivos
        const files = await this.searchFiles({
            ...options,
            allowedExtensions: extensions
        });
        console.log(`📊 Total de arquivos encontrados: ${files.length}`);
        // Criar estrutura raiz
        const rootStructure = {
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
    organizeIntoHierarchy(files, workspaceRoot) {
        const folderMap = new Map();
        const fileStructures = [];
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
                    const folderStructure = {
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
            const fileStructure = {
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
            }
            else {
                fileStructures.push(fileStructure);
            }
        }
        // Organizar pastas em hierarquia
        const rootFolders = [];
        for (const [folderPath, folder] of folderMap.entries()) {
            const parts = folderPath.split(path.sep);
            if (parts.length === 1) {
                // Pasta raiz
                rootFolders.push(folder);
            }
            else {
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
    flattenStructure(structure) {
        const result = [];
        const flatten = (items) => {
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
    hasAllowedExtension(filePath, allowedExtensions) {
        const ext = path.extname(filePath).toLowerCase();
        return allowedExtensions.some(allowed => ext === allowed.toLowerCase());
    }
}
exports.WorkspaceService = WorkspaceService;
//# sourceMappingURL=workspace.service.js.map