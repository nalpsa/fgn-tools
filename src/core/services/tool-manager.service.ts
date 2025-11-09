import { ICategoryMetadata, ITool, ToolCategory, ToolResult } from '../interfaces/tool.interface';
import { AjustarLinhasTool } from '../../tools/file-tools/ajustar-linhas.tool';
import { RemoverTodasLinhasVaziasTool } from '../../tools/file-tools/remover-todas-linhas-vazias.tool';
import { QuoteConverterTool } from '../../tools/file-tools/quote-converter_tool';
import { CommentRemoverTool } from '../../tools/file-tools/comment-remover_tool';
import { TodoDetectorTool } from '../../tools/file-tools/todo-detector_tool';
import { ComplexityAnalyzerTool } from '../../tools/file-tools/complexity-analyzer_tool';

/**
 * Serviço responsável por gerenciar o registro e acesso às ferramentas
 * Seguindo o Princípio da Responsabilidade Única (SRP) e Princípio Aberto/Fechado (OCP)
 * 
 * Responsabilidade: APENAS gerenciar o catálogo de tools
 * - Registrar tools
 * - Recuperar tools
 * - Organizar por categoria
 */
export class ToolManagerService {
    private static instance: ToolManagerService;
    private tools: Map<string, ITool> = new Map();
    private readonly categoryMetadata: Map<ToolCategory, ICategoryMetadata>;

    private constructor() {
        this.categoryMetadata = this.initializeCategoryMetadata();
        this.loadTools(); // Carrega todas as ferramentas automaticamente
    }

    /**
     * Singleton pattern para garantir única instância
     */
    public static getInstance(): ToolManagerService {
        if (!ToolManagerService.instance) {
            ToolManagerService.instance = new ToolManagerService();
        }
        return ToolManagerService.instance;
    }

    /**
     * Carrega todas as ferramentas disponíveis
     * Este é o único método que precisa ser modificado ao adicionar novas tools
     */
    private loadTools(): void {
        console.log('🔧 Carregando ferramentas...');

        // Ferramentas de Arquivo - Linhas
        this.registerTool(new AjustarLinhasTool());
        this.registerTool(new RemoverTodasLinhasVaziasTool());

        // Ferramentas de Texto
        this.registerTool(new QuoteConverterTool());
        this.registerTool(new CommentRemoverTool());

        // Ferramentas de Análise (Código)
        this.registerTool(new TodoDetectorTool());
        this.registerTool(new ComplexityAnalyzerTool());

        console.log(`✅ ${this.tools.size} ferramenta(s) carregada(s) com sucesso!`);
    }

    /**
     * Registra uma nova ferramenta
     * Permite extensão sem modificação (OCP)
     */
    public registerTool(tool: ITool): void {
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
    public registerTools(tools: ITool[]): void {
        tools.forEach(tool => this.registerTool(tool));
        console.log(`📦 Total tools registered: ${this.tools.size}`);
    }

    /**
     * Obtém uma ferramenta pelo ID
     */
    public getTool(id: string): ITool | undefined {
        return this.tools.get(id);
    }

    /**
     * Obtém todas as ferramentas registradas
     */
    public getAllTools(): ITool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Obtém ferramentas por categoria
     */
    public getToolsByCategory(category: ToolCategory): ITool[] {
        return this.getAllTools().filter(tool => tool.category === category);
    }

    /**
     * Obtém todas as categorias com suas ferramentas organizadas
     */
    public getToolsGroupedByCategory(): Map<ToolCategory, ITool[]> {
        const grouped = new Map<ToolCategory, ITool[]>();

        // Inicializa todas as categorias
        Object.values(ToolCategory).forEach(category => {
            grouped.set(category as ToolCategory, []);
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
    public getCategoryMetadata(category: ToolCategory): ICategoryMetadata | undefined {
        return this.categoryMetadata.get(category);
    }

    /**
     * Obtém todos os metadados de categorias
     */
    public getAllCategoryMetadata(): ICategoryMetadata[] {
        return Array.from(this.categoryMetadata.values());
    }

    /**
     * Limpa todas as ferramentas registradas
     * Útil para testes
     */
    public clearTools(): void {
        this.tools.clear();
        console.log('🧹 All tools cleared');
    }

    /**
     * Obtém contagem de ferramentas
     */
    public getToolCount(): number {
        return this.tools.size;
    }

    /**
     * Verifica se uma tool existe
     */
    public hasTool(id: string): boolean {
        return this.tools.has(id);
    }

    /**
     * Executa uma ferramenta pelo ID
     */
    public async executeTool(id: string, input?: any): Promise<ToolResult> {
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
        } catch (error) {
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
    private initializeCategoryMetadata(): Map<ToolCategory, ICategoryMetadata> {
        const metadata = new Map<ToolCategory, ICategoryMetadata>();

        metadata.set(ToolCategory.FILE, {
            id: ToolCategory.FILE,
            name: '📂 Ferramentas de Arquivo',
            icon: 'folder',
            description: 'Manipulação e processamento de arquivos'
        });

        metadata.set(ToolCategory.TEXT, {
            id: ToolCategory.TEXT,
            name: '📝 Ferramentas de Texto',
            icon: 'file-text',
            description: 'Transformação e formatação de texto'
        });

        metadata.set(ToolCategory.CODE, {
            id: ToolCategory.CODE,
            name: '💻 Ferramentas de Código',
            icon: 'code',
            description: 'Análise e refatoração de código'
        });

        metadata.set(ToolCategory.FORMAT, {
            id: ToolCategory.FORMAT,
            name: '🎨 Formatadores',
            icon: 'paintcan',
            description: 'Formatação e beautification'
        });

        metadata.set(ToolCategory.OTHER, {
            id: ToolCategory.OTHER,
            name: '🔧 Outras Ferramentas',
            icon: 'tools',
            description: 'Utilitários diversos'
        });

        return metadata;
    }

    /**
     * Obtém estatísticas das ferramentas
     */
    public getStatistics(): {
        total: number;
        byCategory: Record<string, number>;
    } {
        const stats = {
            total: this.tools.size,
            byCategory: {} as Record<string, number>
        };

        Object.values(ToolCategory).forEach(category => {
            const count = this.getToolsByCategory(category as ToolCategory).length;
            if (count > 0) {
                stats.byCategory[category] = count;
            }
        });

        return stats;
    }
}