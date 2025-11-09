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
exports.FileSystemService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * Serviço para operações de sistema de arquivos
 * Encapsula fs/promises para facilitar testes e manutenção
 */
class FileSystemService {
    constructor() { }
    static getInstance() {
        if (!FileSystemService.instance) {
            FileSystemService.instance = new FileSystemService();
        }
        return FileSystemService.instance;
    }
    /**
     * Lê o conteúdo de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Conteúdo do arquivo como string
     */
    async readFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf-8');
        }
        catch (error) {
            throw new Error(`Erro ao ler arquivo ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Escreve conteúdo em um arquivo
     * @param filePath Caminho do arquivo
     * @param content Conteúdo a ser escrito
     */
    async writeFile(filePath, content) {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            throw new Error(`Erro ao escrever arquivo ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Verifica se um arquivo ou diretório existe
     * @param filePath Caminho do arquivo/diretório
     * @returns true se existe, false caso contrário
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Verifica se um caminho é um diretório
     * @param dirPath Caminho a verificar
     * @returns true se é diretório, false caso contrário
     */
    async isDirectory(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    /**
     * Verifica se um caminho é um arquivo
     * @param filePath Caminho a verificar
     * @returns true se é arquivo, false caso contrário
     */
    async isFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    /**
     * Lista o conteúdo de um diretório
     * @param dirPath Caminho do diretório
     * @returns Array com nomes dos arquivos/pastas
     */
    async readDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            return entries.map(entry => entry.name);
        }
        catch (error) {
            throw new Error(`Erro ao ler diretório ${dirPath}: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Processa uma pasta recursivamente aplicando um callback em cada arquivo
     * @param dirPath Caminho da pasta
     * @param callback Função a ser executada para cada arquivo
     * @param options Opções de processamento
     * @returns Estatísticas do processamento
     */
    async processFolder(dirPath, callback, options = {}) {
        const stats = { processedFiles: 0, errors: 0 };
        const { excludePatterns = [], includeExtensions = [] } = options;
        try {
            const entries = await this.readDirectory(dirPath);
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry);
                // Verificar se deve ser excluído
                if (this.shouldExclude(entry, excludePatterns)) {
                    continue;
                }
                if (await this.isDirectory(fullPath)) {
                    // Recursão em subpastas
                    const subStats = await this.processFolder(fullPath, callback, options);
                    stats.processedFiles += subStats.processedFiles;
                    stats.errors += subStats.errors;
                }
                else if (await this.isFile(fullPath)) {
                    // Processar arquivo se passar no filtro de extensões
                    if (includeExtensions.length === 0 || this.hasValidExtension(fullPath, includeExtensions)) {
                        try {
                            await callback(fullPath);
                            stats.processedFiles++;
                        }
                        catch (error) {
                            console.error(`Erro ao processar ${fullPath}:`, error);
                            stats.errors++;
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(`Erro ao processar pasta ${dirPath}:`, error);
            stats.errors++;
        }
        return stats;
    }
    /**
     * Verifica se um arquivo é de texto baseado na extensão
     * @param filePath Caminho do arquivo
     * @param validExtensions Lista de extensões válidas (opcional)
     * @returns true se é arquivo de texto
     */
    isTextFile(filePath, validExtensions) {
        const defaultExtensions = [
            '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
            '.md', '.txt', '.xml', '.yaml', '.yml', '.py', '.java', '.c', '.cpp',
            '.h', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart',
            '.vue', '.svelte', '.sql', '.sh', '.bash', '.ps1', '.bat', '.cmd'
        ];
        const extensions = validExtensions || defaultExtensions;
        const ext = this.getFileExtension(filePath);
        return extensions.includes(ext);
    }
    /**
     * Obtém a extensão de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Extensão com ponto (ex: '.ts')
     */
    getFileExtension(filePath) {
        return path.extname(filePath).toLowerCase();
    }
    /**
     * Obtém informações sobre um arquivo
     * @param filePath Caminho do arquivo
     * @returns Stats do arquivo
     */
    async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile()
            };
        }
        catch (error) {
            throw new Error(`Erro ao obter informações de ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Cria um backup de um arquivo
     * @param filePath Caminho do arquivo
     * @returns Caminho do backup criado
     */
    async createBackup(filePath) {
        const backupPath = `${filePath}.backup`;
        try {
            const content = await this.readFile(filePath);
            await this.writeFile(backupPath, content);
            return backupPath;
        }
        catch (error) {
            throw new Error(`Erro ao criar backup de ${filePath}: ${this.getErrorMessage(error)}`);
        }
    }
    /**
     * Verifica se um arquivo/pasta deve ser excluído baseado em padrões
     * @param name Nome do arquivo/pasta
     * @param patterns Padrões de exclusão
     * @returns true se deve ser excluído
     */
    shouldExclude(name, patterns) {
        return patterns.some(pattern => {
            if (pattern.includes('*')) {
                // Padrão com wildcard (simplificado)
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(name);
            }
            return name === pattern || name.startsWith(pattern);
        });
    }
    /**
     * Verifica se um arquivo tem uma extensão válida
     * @param filePath Caminho do arquivo
     * @param validExtensions Lista de extensões válidas
     * @returns true se tem extensão válida
     */
    hasValidExtension(filePath, validExtensions) {
        const ext = this.getFileExtension(filePath);
        return validExtensions.includes(ext);
    }
    /**
     * Extrai mensagem de erro de um objeto Error
     * @param error Erro capturado
     * @returns Mensagem de erro formatada
     */
    getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}
exports.FileSystemService = FileSystemService;
//# sourceMappingURL=file-system.service.js.map