"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolManagerService = void 0;
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
    async executeTool(toolId, input) {
        const tool = this.getTool(toolId);
        if (!tool) {
            console.error(`❌ Ferramenta não encontrada: ${toolId}`);
            return {
                success: false,
                error: `Ferramenta não encontrada: ${toolId}`
            };
        }
        try {
            console.log(`🎯 Executando tool: ${tool.name} (${toolId})`);
            console.log(`📁 Input recebido:`, {
                selections: input.selections?.length || 0,
                workspacePath: input.workspacePath
            });
            if (input.selections) {
                input.selections.forEach((selection, index) => {
                    console.log(`   [${index}] ${selection.name} (${selection.type}) - ${selection.path}`);
                });
            }
            return await tool.execute(input);
        }
        catch (error) {
            console.error(`❌ Erro executando ${tool.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: `Erro interno: ${errorMessage}`
            };
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
            icon: '💻',
            description: 'Manipulação e análise de código fonte'
        });
        metadata.set(tool_interface_1.ToolCategory.TEXT, {
            id: tool_interface_1.ToolCategory.TEXT,
            name: '📝 Ferramentas de Texto',
            icon: '📝',
            description: 'Processamento e transformação de texto'
        });
        metadata.set(tool_interface_1.ToolCategory.FILE, {
            id: tool_interface_1.ToolCategory.FILE,
            name: '📁 Ferramentas de Arquivo',
            icon: '📁',
            description: 'Operações com arquivos e diretórios'
        });
        metadata.set(tool_interface_1.ToolCategory.FORMAT, {
            id: tool_interface_1.ToolCategory.FORMAT,
            name: '🎨 Formatadores',
            icon: '🎨',
            description: 'Formatação e beautification de código'
        });
        metadata.set(tool_interface_1.ToolCategory.OTHER, {
            id: tool_interface_1.ToolCategory.OTHER,
            name: '🔧 Outras Ferramentas',
            icon: '🔧',
            description: 'Utilitários diversos'
        });
        return metadata;
    }
}
exports.ToolManagerService = ToolManagerService;
//# sourceMappingURL=tool-manager.service.js.map