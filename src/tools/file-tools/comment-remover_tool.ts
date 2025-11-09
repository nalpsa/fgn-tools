import { ToolConfig, ToolResult, ToolCategory } from '../../core/interfaces/tool.interface';
import { IFileProcessingStrategy } from '../../core/interfaces/file-processor.interface';
import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { CommentRemoverStrategy } from '../../core/strategies/comment-remover.strategy';

/**
 * Tool para remoção de comentários
 * Herda de BaseFileTool para reaproveitar toda a lógica
 * 
 * Responsabilidade: Apenas definir ID, nome, descrição e strategy
 * - Define ID único: 'comment-remover'
 * - Define nome e descrição
 * - Retorna a strategy de remoção de comentários
 */
export class CommentRemoverTool extends BaseFileTool {
    readonly id = 'comment-remover';
    readonly name = 'Removedor de Comentários';
    readonly description = 'Remove comentários de código preservando strings';
    readonly icon = 'comment';
    readonly category = ToolCategory.CODE;

    // Strategy tipada como propriedade
    private strategy: CommentRemoverStrategy;

    constructor() {
        super();
        this.strategy = new CommentRemoverStrategy();
    }

    /**
     * Retorna a strategy de remoção de comentários
     */
    protected getStrategy(): IFileProcessingStrategy {
        return this.strategy;
    }

    /**
     * Configuração específica da UI desta tool
     */
    protected getToolConfig(): ToolConfig {
        return {
            icon: 'comment',
            title: this.name,
            description: this.description,
            confirmMessage: '⚠️ ATENÇÃO: Esta ação removerá comentários dos arquivos selecionados.\n\nDeseja continuar?',
            successMessage: '✅ Comentários removidos com sucesso!',
            errorMessage: '❌ Erro ao remover comentários',
            buttonText: 'Remover Comentários',
            buttonIcon: 'comment',
            fileExtensions: [
                '.js', '.jsx',
                '.ts', '.tsx',
                '.java',
                '.py',
                '.php',
                '.c', '.cpp', '.h',
                '.go',
                '.rs',
                '.swift',
                '.kt',
                '.html',
                '.css', '.scss'
            ]
        };
    }
}