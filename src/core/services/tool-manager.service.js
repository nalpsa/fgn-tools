"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolManager = void 0;
const tool_interface_1 = require("../interfaces/tool.interface");
class ToolManager {
    constructor() {
        this.tools = new Map();
        this.toolsByCategory = new Map();
        Object.values(tool_interface_1.ToolCategory).forEach(category => {
            this.toolsByCategory.set(category, []);
        });
    }
    registerTool(tool) {
        this.tools.set(tool.id, tool);
        const categoryTools = this.toolsByCategory.get(tool.category) || [];
        categoryTools.push(tool);
        this.toolsByCategory.set(tool.category, categoryTools);
        console.log(`🔧 Tool registrada: ${tool.name} (${tool.category})`);
    }
    getTool(id) {
        return this.tools.get(id);
    }
    getToolsByCategory(category) {
        return this.toolsByCategory.get(category) || [];
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    async executeTool(toolId, input) {
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
        }
        catch (error) {
            console.error(`❌ Erro executando ${tool.name}:`, error);
            return {
                success: false,
                error: `Erro interno: ${error}`
            };
        }
    }
}
exports.ToolManager = ToolManager;
//# sourceMappingURL=tool-manager.service.js.map