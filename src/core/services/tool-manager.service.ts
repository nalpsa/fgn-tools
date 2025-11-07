import { ICategoryMetadata, ITool, ToolCategory, ToolResult } from '../interfaces/tool.interface';

/**
 * Serviço responsável por gerenciar o registro e acesso às ferramentas
 * Seguindo o Princípio da Responsabilidade Única (SRP) e Princípio Aberto/Fechado (OCP)
 */
export class ToolManagerService {
    private static instance: ToolManagerService;
    private tools: Map<string, ITool> = new Map();
    private readonly categoryMetadata: Map<ToolCategory, ICategoryMetadata>;

    private constructor() {
        this.categoryMetadata = this.initializeCategoryMetadata();
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
     * Registra uma nova ferramenta
     * Permite extensão sem modificação (OCP)
     */
    public registerTool(tool: ITool): void {
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
    public registerTools(tools: ITool[]): void {
        tools.forEach(tool => this.registerTool(tool));
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
     * Executa uma ferramenta pelo ID
     */
    async executeTool(toolId: string, input: any): Promise<ToolResult> {
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
                input.selections.forEach((selection: any, index: number) => {
                    console.log(`   [${index}] ${selection.name} (${selection.type}) - ${selection.path}`);
                });
            }
            
            return await tool.execute(input);
        } catch (error) {
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
    public clearTools(): void {
        this.tools.clear();
        console.log('🧹 All tools cleared');
    }

    /**
     * Inicializa os metadados das categorias
     */
    private initializeCategoryMetadata(): Map<ToolCategory, ICategoryMetadata> {
        const metadata = new Map<ToolCategory, ICategoryMetadata>();

        metadata.set(ToolCategory.CODE, {
            id: ToolCategory.CODE,
            name: '💻 Ferramentas de Código',
            icon: '💻',
            description: 'Manipulação e análise de código fonte'
        });

        metadata.set(ToolCategory.TEXT, {
            id: ToolCategory.TEXT,
            name: '📝 Ferramentas de Texto',
            icon: '📝',
            description: 'Processamento e transformação de texto'
        });

        metadata.set(ToolCategory.FILE, {
            id: ToolCategory.FILE,
            name: '📁 Ferramentas de Arquivo',
            icon: '📁',
            description: 'Operações com arquivos e diretórios'
        });

        metadata.set(ToolCategory.FORMAT, {
            id: ToolCategory.FORMAT,
            name: '🎨 Formatadores',
            icon: '🎨',
            description: 'Formatação e beautification de código'
        });

        metadata.set(ToolCategory.OTHER, {
            id: ToolCategory.OTHER,
            name: '🔧 Outras Ferramentas',
            icon: '🔧',
            description: 'Utilitários diversos'
        });

        return metadata;
    }
}