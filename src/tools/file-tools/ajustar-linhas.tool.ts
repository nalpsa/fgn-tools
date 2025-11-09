import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { AdjustLinesStrategy } from '../../core/strategies/adjust-lines.strategy';
import { IFileProcessingStrategy } from '../../core/interfaces/file-processor.interface';
import { ToolConfig } from '../../core/interfaces/tool.interface';
import { ToolCategory } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para ajustar linhas vazias
 * Remove linhas vazias excedentes, mantendo apenas 1 entre blocos de código
 * 
 * REFATORADO: Apenas configuração - toda lógica está na BaseFileTool + Strategy
 */
export class AjustarLinhasTool extends BaseFileTool {
    id = 'ajustar-linhas';
    name = 'Ajustar Linhas Vazias';
    description = 'Remove linhas vazias excedentes mantendo apenas 1 linha entre blocos de código';
    icon = '🪄';
    category = ToolCategory.FILE;

    /**
     * Retorna a strategy específica desta tool
     * SOLID: Strategy Pattern - lógica de processamento isolada
     */
    protected getStrategy(): IFileProcessingStrategy {
        return new AdjustLinesStrategy();
    }

    /**
     * Retorna a configuração da UI desta tool
     * SOLID: Configuration Object - UI configurável
     */
    protected getToolConfig(): ToolConfig {
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