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
exports.ToolManagerService = void 0;
const vscode = __importStar(require("vscode"));
const tool_interface_1 = require("../interfaces/tool.interface");
/**
 * Serviço responsável por gerenciar o registro e acesso às ferramentas
 * Seguindo o Princípio da Responsabilidade Única (SRP) e Princípio Aberto/Fechado (OCP)
 */
class ToolManagerService {
    constructor() {
        this.tools = new Map();
        this.categoryMetadata = this.initializeCategoryMetadata();
    }
    /**
     * Singleton pattern para garantir única instância
     */
    static getInstance() {
        if (!ToolManagerService.instance) {
            ToolManagerService.instance = new ToolManagerService();
        }
        return ToolManagerService.instance;
    }
    /**
     * Registra uma nova ferramenta
     * Permite extensão sem modificação (OCP)
     */
    registerTool(tool) {
        if (this.tools.has(tool.id)) {
            console.warn(`Tool with id "${tool.id}" is already registered. Skipping.`);
            return;
        }
        this.tools.set(tool.id, tool);
        console.log(`✅ Tool registered: ${tool.name} (${tool.id})`);
    }
    /**
     * Registra múltiplas ferramentas de uma vez
     */
    registerTools(tools) {
        tools.forEach(tool => this.registerTool(tool));
    }
    /**
     * Obtém uma ferramenta pelo ID
     */
    getTool(id) {
        return this.tools.get(id);
    }
    /**
     * Obtém todas as ferramentas registradas
     */
    getAllTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Obtém ferramentas por categoria
     */
    getToolsByCategory(category) {
        return this.getAllTools().filter(tool => tool.category === category);
    }
    /**
     * Obtém todas as categorias com suas ferramentas organizadas
     */
    getToolsGroupedByCategory() {
        const grouped = new Map();
        // Inicializa todas as categorias
        Object.values(tool_interface_1.ToolCategory).forEach(category => {
            grouped.set(category, []);
        });
        // Agrupa as ferramentas
        this.getAllTools().forEach(tool => {
            const tools = grouped.get(tool.category) || [];
            tools.push(tool);
            grouped.set(tool.category, tools);
        });
        return grouped;
    }
    /**
     * Obtém metadados de uma categoria
     */
    getCategoryMetadata(category) {
        return this.categoryMetadata.get(category);
    }
    /**
     * Obtém todos os metadados de categorias
     */
    getAllCategoryMetadata() {
        return Array.from(this.categoryMetadata.values());
    }
    /**
     * Executa uma ferramenta pelo ID
     */
    async executeTool(id) {
        const tool = this.getTool(id);
        if (!tool) {
            vscode.window.showErrorMessage(`Tool "${id}" not found!`);
            return;
        }
        try {
            await tool.activate();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error executing tool "${tool.name}": ${errorMessage}`);
            console.error(`Error executing tool ${id}:`, error);
        }
    }
    /**
     * Limpa todas as ferramentas registradas
     */
    clearTools() {
        this.tools.clear();
        console.log('🧹 All tools cleared');
    }
    /**
     * Inicializa os metadados das categorias
     */
    initializeCategoryMetadata() {
        const metadata = new Map();
        metadata.set(tool_interface_1.ToolCategory.CODE, {
            id: tool_interface_1.ToolCategory.CODE,
            name: '💻 Ferramentas de Código',
            icon: 'code',
            description: 'Manipulação e análise de código fonte'
        });
        metadata.set(tool_interface_1.ToolCategory.TEXT, {
            id: tool_interface_1.ToolCategory.TEXT,
            name: '📝 Ferramentas de Texto',
            icon: 'file-text',
            description: 'Processamento e transformação de texto'
        });
        metadata.set(tool_interface_1.ToolCategory.FILE, {
            id: tool_interface_1.ToolCategory.FILE,
            name: '📁 Ferramentas de Arquivo',
            icon: 'folder',
            description: 'Operações com arquivos e diretórios'
        });
        metadata.set(tool_interface_1.ToolCategory.FORMATTERS, {
            id: tool_interface_1.ToolCategory.FORMATTERS,
            name: '🎨 Formatadores',
            icon: 'paintcan',
            description: 'Formatação e beautification de código'
        });
        metadata.set(tool_interface_1.ToolCategory.OTHER, {
            id: tool_interface_1.ToolCategory.OTHER,
            name: '🔧 Outras Ferramentas',
            icon: 'tools',
            description: 'Utilitários diversos'
        });
        return metadata;
    }
}
exports.ToolManagerService = ToolManagerService;
//# sourceMappingURL=tool-manager.service.js.map