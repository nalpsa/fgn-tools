/**
 * Arquivo de tipos auxiliares para categorias de ferramentas
 * Este arquivo é opcional, pois os tipos já estão em tool.interface.ts
 * Mantido para referência e possível expansão futura
 */

import { ToolCategory } from '../interfaces/tool.interface';

/**
 * Re-exporta ToolCategory para facilitar importação
 */
export { ToolCategory };

/**
 * Tipo auxiliar para validação de categorias
 */
export type ToolCategoryValue = `${ToolCategory}`;

/**
 * Mapeamento de categorias para suas propriedades
 */
export const CATEGORY_CONFIG = {
    [ToolCategory.CODE]: {
        displayName: '💻 Ferramentas de Código',
        icon: 'code',
        description: 'Manipulação e análise de código fonte',
        order: 1
    },
    [ToolCategory.TEXT]: {
        displayName: '📝 Ferramentas de Texto',
        icon: 'file-text',
        description: 'Processamento e transformação de texto',
        order: 2
    },
    [ToolCategory.FILE]: {
        displayName: '📁 Ferramentas de Arquivo',
        icon: 'folder',
        description: 'Operações com arquivos e diretórios',
        order: 3
    },
    [ToolCategory.FORMAT]: { // Corrigido para FORMAT
        displayName: '🎨 Formatadores',
        icon: 'paintcan',
        description: 'Formatação e beautification de código',
        order: 4
    },
    [ToolCategory.OTHER]: {
        displayName: '🔧 Outras Ferramentas',
        icon: 'tools',
        description: 'Utilitários diversos',
        order: 5
    }
} as const;

/**
 * Obtém todas as categorias em ordem
 */
export function getAllCategoriesOrdered(): ToolCategory[] {
    return Object.entries(CATEGORY_CONFIG)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([key]) => key as ToolCategory);
}

/**
 * Valida se uma string é uma categoria válida
 */
export function isValidCategory(value: string): value is ToolCategory {
    return Object.values(ToolCategory).includes(value as ToolCategory);
}