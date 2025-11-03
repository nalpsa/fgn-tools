import { ITool, ToolCategory, ToolResult } from '../interfaces/tool.interface';

export class ToolManager {
    private tools: Map<string, ITool> = new Map();
    private toolsByCategory: Map<ToolCategory, ITool[]> = new Map();

    constructor() {
        Object.values(ToolCategory).forEach(category => {
            this.toolsByCategory.set(category, []);
        });
    }

    registerTool(tool: ITool): void {
        this.tools.set(tool.id, tool);
        
        const categoryTools = this.toolsByCategory.get(tool.category) || [];
        categoryTools.push(tool);
        this.toolsByCategory.set(tool.category, categoryTools);
        
        console.log(`🔧 Tool registrada: ${tool.name} (${tool.category})`);
    }

    getTool(id: string): ITool | undefined {
        return this.tools.get(id);
    }

    getToolsByCategory(category: ToolCategory): ITool[] {
        return this.toolsByCategory.get(category) || [];
    }

    getAllTools(): ITool[] {
        return Array.from(this.tools.values());
    }

    async executeTool(toolId: string, input: any): Promise<ToolResult> {
        const tool = this.getTool(toolId);
        if (!tool) {
            return {
                success: false,
                error: `Ferramenta não encontrada: ${toolId}`
            };
        }

        try {
            console.log(`🎯 Executando tool: ${tool.name}`);
            return await tool.execute(input);
        } catch (error) {
            console.error(`❌ Erro executando ${tool.name}:`, error);
            return {
                success: false,
                error: `Erro interno: ${error}`
            };
        }
    }
}