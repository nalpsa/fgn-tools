"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolManagerService = void 0;
const tool_interface_1 = require("../interfaces/tool.interface");
const ajustar_linhas_tool_1 = require("../../tools/file-tools/ajustar-linhas.tool");
const remover_todas_linhas_vazias_tool_1 = require("../../tools/file-tools/remover-todas-linhas-vazias.tool");
const quote_converter_tool_1 = require("../../tools/file-tools/quote-converter_tool");
const comment_remover_tool_1 = require("../../tools/file-tools/comment-remover_tool");
const todo_detector_tool_1 = require("../../tools/file-tools/todo-detector_tool");
const complexity_analyzer_tool_1 = require("../../tools/file-tools/complexity-analyzer_tool");
/**
 * Serviço responsável por gerenciar o registro e acesso às ferramentas
 * Seguindo o Princípio da Responsabilidade Única (SRP) e Princípio Aberto/Fechado (OCP)
 *
 * Responsabilidade: APENAS gerenciar o catálogo de tools
 * - Registrar tools
 * - Recuperar tools
 * - Organizar por categoria
 */
class ToolManagerService {
    constructor() {
        this.tools = new Map();
        this.categoryMetadata = this.initializeCategoryMetadata();
        this.loadTools(); // Carrega todas as ferramentas automaticamente
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
     * Carrega todas as ferramentas disponíveis
     * Este é o único método que precisa ser modificado ao adicionar novas tools
     */
    loadTools() {
        console.log('🔧 Carregando ferramentas...');
        // Ferramentas de Arquivo - Linhas
        this.registerTool(new ajustar_linhas_tool_1.AjustarLinhasTool());
        this.registerTool(new remover_todas_linhas_vazias_tool_1.RemoverTodasLinhasVaziasTool());
        // Ferramentas de Texto
        this.registerTool(new quote_converter_tool_1.QuoteConverterTool());
        this.registerTool(new comment_remover_tool_1.CommentRemoverTool());
        // Ferramentas de Análise (Código)
        this.registerTool(new todo_detector_tool_1.TodoDetectorTool());
        this.registerTool(new complexity_analyzer_tool_1.ComplexityAnalyzerTool());
        console.log(`✅ ${this.tools.size} ferramenta(s) carregada(s) com sucesso!`);
    }
    /**
     * Registra uma nova ferramenta
     * Permite extensão sem modificação (OCP)
     */
    registerTool(tool) {
        if (this.tools.has(tool.id)) {
            console.warn(`⚠️  Tool with id "${tool.id}" is already registered. Skipping.`);
            return;
        }
        this.tools.set(tool.id, tool);
        console.log(`  ✓ ${tool.name} (${tool.id})`);
    }
    /**
     * Registra múltiplas ferramentas de uma vez
     */
    registerTools(tools) {
        tools.forEach(tool => this.registerTool(tool));
        console.log(`📦 Total tools registered: ${this.tools.size}`);
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
     * Limpa todas as ferramentas registradas
     * Útil para testes
     */
    clearTools() {
        this.tools.clear();
        console.log('🧹 All tools cleared');
    }
    /**
     * Obtém contagem de ferramentas
     */
    getToolCount() {
        return this.tools.size;
    }
    /**
     * Verifica se uma tool existe
     */
    hasTool(id) {
        return this.tools.has(id);
    }
    /**
     * Executa uma ferramenta pelo ID
     */
    async executeTool(id, input) {
        const tool = this.getTool(id);
        if (!tool) {
            return {
                success: false,
                error: `Ferramenta "${id}" não encontrada`
            };
        }
        try {
            console.log(`🚀 Executando: ${tool.name}`);
            const result = await tool.execute(input);
            console.log(`✅ ${tool.name} executada com sucesso`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Erro ao executar ${tool.name}:`, errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    /**
     * Inicializa os metadados das categorias
     */
    initializeCategoryMetadata() {
        const metadata = new Map();
        metadata.set(tool_interface_1.ToolCategory.FILE, {
            id: tool_interface_1.ToolCategory.FILE,
            name: '📂 Ferramentas de Arquivo',
            icon: 'folder',
            description: 'Manipulação e processamento de arquivos'
        });
        metadata.set(tool_interface_1.ToolCategory.TEXT, {
            id: tool_interface_1.ToolCategory.TEXT,
            name: '📝 Ferramentas de Texto',
            icon: 'file-text',
            description: 'Transformação e formatação de texto'
        });
        metadata.set(tool_interface_1.ToolCategory.CODE, {
            id: tool_interface_1.ToolCategory.CODE,
            name: '💻 Ferramentas de Código',
            icon: 'code',
            description: 'Análise e refatoração de código'
        });
        metadata.set(tool_interface_1.ToolCategory.FORMAT, {
            id: tool_interface_1.ToolCategory.FORMAT,
            name: '🎨 Formatadores',
            icon: 'paintcan',
            description: 'Formatação e beautification'
        });
        metadata.set(tool_interface_1.ToolCategory.OTHER, {
            id: tool_interface_1.ToolCategory.OTHER,
            name: '🔧 Outras Ferramentas',
            icon: 'tools',
            description: 'Utilitários diversos'
        });
        return metadata;
    }
    /**
     * Obtém estatísticas das ferramentas
     */
    getStatistics() {
        const stats = {
            total: this.tools.size,
            byCategory: {}
        };
        Object.values(tool_interface_1.ToolCategory).forEach(category => {
            const count = this.getToolsByCategory(category).length;
            if (count > 0) {
                stats.byCategory[category] = count;
            }
        });
        return stats;
    }
}
exports.ToolManagerService = ToolManagerService;
//# sourceMappingURL=tool-manager.service.js.map