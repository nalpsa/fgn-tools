"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjustarLinhasTool = void 0;
const base_file_tool_1 = require("../../features/tools/base/base-file-tool");
const adjust_lines_strategy_1 = require("../../core/strategies/adjust-lines.strategy");
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para ajustar linhas vazias
 * Remove linhas vazias excedentes, mantendo apenas 1 entre blocos de código
 *
 * REFATORADO: Apenas configuração - toda lógica está na BaseFileTool + Strategy
 */
class AjustarLinhasTool extends base_file_tool_1.BaseFileTool {
    constructor() {
        super(...arguments);
        this.id = 'ajustar-linhas';
        this.name = 'Ajustar Linhas Vazias';
        this.description = 'Remove linhas vazias excedentes mantendo apenas 1 linha entre blocos de código';
        this.icon = '🪄';
        this.category = tool_interface_1.ToolCategory.FILE;
    }
    /**
     * Retorna a strategy específica desta tool
     * SOLID: Strategy Pattern - lógica de processamento isolada
     */
    getStrategy() {
        return new adjust_lines_strategy_1.AdjustLinesStrategy();
    }
    /**
     * Retorna a configuração da UI desta tool
     * SOLID: Configuration Object - UI configurável
     */
    getToolConfig() {
        return {
            icon: 'wand',
            title: 'Ajustar Linhas Vazias',
            description: 'Remove linhas vazias excedentes mantendo apenas 1 linha entre blocos de código',
            infoBox: {
                title: 'ℹ️ Como funciona',
                content: `Esta ferramenta analisa seu código e:
                
• Mantém apenas **1 linha vazia** entre blocos de código
• Remove linhas vazias duplicadas (2+ consecutivas)
• Remove linha vazia final do arquivo
• Preserva a estrutura e indentação do código

**Exemplo:**
\`\`\`
function hello() {
    console.log('Hello');
}


function world() {  // 3 linhas vazias acima
    console.log('World');
}
\`\`\`

**Resultado:**
\`\`\`
function hello() {
    console.log('Hello');
}

function world() {  // Apenas 1 linha vazia
    console.log('World');
}
\`\`\``
            },
            warningBox: {
                title: '⚠️ Atenção',
                content: 'Esta ferramenta ajustará as linhas vazias dos arquivos selecionados. Esta ação **não pode ser desfeita** após salvar. Certifique-se de ter backup ou commit no Git antes de executar.'
            },
            confirmMessage: 'Deseja ajustar as linhas vazias dos arquivos selecionados?\n\nEsta ação não pode ser desfeita.',
            successMessage: 'Linhas ajustadas com sucesso!',
            errorMessage: 'Erro ao ajustar linhas vazias',
            buttonText: 'Executar Ajuste',
            buttonIcon: 'wand'
        };
    }
}
exports.AjustarLinhasTool = AjustarLinhasTool;
//# sourceMappingURL=ajustar-linhas.tool.js.map