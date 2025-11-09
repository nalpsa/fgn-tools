"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoverTodasLinhasVaziasTool = void 0;
const base_file_tool_1 = require("../../features/tools/base/base-file-tool");
const remove_empty_lines_strategy_1 = require("../../core/strategies/remove-empty-lines.strategy");
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para remover TODAS as linhas vazias
 * Remove completamente todas as linhas em branco dos arquivos
 *
 * REFATORADO: Apenas configuração - toda lógica está na BaseFileTool + Strategy
 */
class RemoverTodasLinhasVaziasTool extends base_file_tool_1.BaseFileTool {
    constructor() {
        super(...arguments);
        this.id = 'remove-all-empty-lines';
        this.name = 'Remover Todas Linhas Vazias';
        this.description = 'Remove completamente todas as linhas em branco dos arquivos';
        this.icon = '🗑️';
        this.category = tool_interface_1.ToolCategory.FILE;
    }
    /**
     * Retorna a strategy específica desta tool
     * SOLID: Strategy Pattern - lógica de processamento isolada
     */
    getStrategy() {
        return new remove_empty_lines_strategy_1.RemoveEmptyLinesStrategy();
    }
    /**
     * Retorna a configuração da UI desta tool
     * SOLID: Configuration Object - UI configurável
     */
    getToolConfig() {
        return {
            icon: 'trash',
            title: 'Remover Todas Linhas Vazias',
            description: 'Remove completamente todas as linhas em branco dos arquivos',
            infoBox: {
                title: 'ℹ️ Como funciona',
                content: `Esta ferramenta remove **TODAS** as linhas vazias dos arquivos selecionados.

• Remove linhas completamente vazias
• Remove linhas com apenas espaços/tabs
• Mantém linhas com código
• Preserva indentação do código

**Ideal para:** Compactar arquivos, reduzir tamanho, código ultra-denso.`
            },
            warningBox: {
                title: '⚠️ Atenção',
                content: 'Esta ferramenta removerá **TODAS** as linhas vazias dos arquivos selecionados. O código ficará muito compacto. Esta ação **não pode ser desfeita**. Certifique-se de ter backup ou commit no Git.'
            },
            confirmMessage: 'Deseja remover TODAS as linhas vazias dos arquivos selecionados?\n\nEsta ação não pode ser desfeita.',
            successMessage: 'Linhas removidas com sucesso!',
            errorMessage: 'Erro ao remover linhas vazias',
            buttonText: 'Executar Remoção',
            buttonIcon: 'trash'
        };
    }
}
exports.RemoverTodasLinhasVaziasTool = RemoverTodasLinhasVaziasTool;
//# sourceMappingURL=remover-todas-linhas-vazias.tool.js.map