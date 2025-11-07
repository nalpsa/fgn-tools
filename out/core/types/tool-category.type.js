"use strict";
/**
 * Arquivo de tipos auxiliares para categorias de ferramentas
 * Este arquivo é opcional, pois os tipos já estão em tool.interface.ts
 * Mantido para referência e possível expansão futura
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_CONFIG = exports.ToolCategory = void 0;
exports.getAllCategoriesOrdered = getAllCategoriesOrdered;
exports.isValidCategory = isValidCategory;
const tool_interface_1 = require("../interfaces/tool.interface");
Object.defineProperty(exports, "ToolCategory", { enumerable: true, get: function () { return tool_interface_1.ToolCategory; } });
/**
 * Mapeamento de categorias para suas propriedades
 */
exports.CATEGORY_CONFIG = {
    [tool_interface_1.ToolCategory.CODE]: {
        displayName: '💻 Ferramentas de Código',
        icon: 'code',
        description: 'Manipulação e análise de código fonte',
        order: 1
    },
    [tool_interface_1.ToolCategory.TEXT]: {
        displayName: '📝 Ferramentas de Texto',
        icon: 'file-text',
        description: 'Processamento e transformação de texto',
        order: 2
    },
    [tool_interface_1.ToolCategory.FILE]: {
        displayName: '📁 Ferramentas de Arquivo',
        icon: 'folder',
        description: 'Operações com arquivos e diretórios',
        order: 3
    },
    [tool_interface_1.ToolCategory.FORMAT]: {
        displayName: '🎨 Formatadores',
        icon: 'paintcan',
        description: 'Formatação e beautification de código',
        order: 4
    },
    [tool_interface_1.ToolCategory.OTHER]: {
        displayName: '🔧 Outras Ferramentas',
        icon: 'tools',
        description: 'Utilitários diversos',
        order: 5
    }
};
/**
 * Obtém todas as categorias em ordem
 */
function getAllCategoriesOrdered() {
    return Object.entries(exports.CATEGORY_CONFIG)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([key]) => key);
}
/**
 * Valida se uma string é uma categoria válida
 */
function isValidCategory(value) {
    return Object.values(tool_interface_1.ToolCategory).includes(value);
}
//# sourceMappingURL=tool-category.type.js.map