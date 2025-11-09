import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { RemoveEmptyLinesStrategy } from '../../core/strategies/remove-empty-lines.strategy';
import { IFileProcessingStrategy } from '../../core/interfaces/file-processor.interface';
import { ToolConfig } from '../../core/interfaces/tool.interface';
import { ToolCategory } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para remover TODAS as linhas vazias
 * Remove completamente todas as linhas em branco dos arquivos
 * 
 * REFATORADO: Apenas configuração - toda lógica está na BaseFileTool + Strategy
 */
export class RemoverTodasLinhasVaziasTool extends BaseFileTool {
    id = 'remove-all-empty-lines';
    name = 'Remover Todas Linhas Vazias';
    description = 'Remove completamente todas as linhas em branco dos arquivos';
    icon = '🗑️';
    category = ToolCategory.FILE;

    /**
     * Retorna a strategy específica desta tool
     * SOLID: Strategy Pattern - lógica de processamento isolada
     */
    protected getStrategy(): IFileProcessingStrategy {
        return new RemoveEmptyLinesStrategy();
    }

    /**
     * Retorna a configuração da UI desta tool
     * SOLID: Configuration Object - UI configurável
     */
    protected getToolConfig(): ToolConfig {
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