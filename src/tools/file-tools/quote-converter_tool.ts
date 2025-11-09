import { ToolConfig, ToolResult, ToolCategory } from '../../core/interfaces/tool.interface';
import { IFileProcessingStrategy } from '../../core/interfaces/file-processor.interface';
import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { QuoteConverterStrategy } from '../../core/strategies/quote-converter_strategy';

/**
 * Tool para conversão de aspas
 * Herda de BaseFileTool para reaproveitar toda a lógica
 * 
 * Responsabilidade: Apenas definir ID, nome, descrição e strategy
 * - Define ID único: 'quote-converter'
 * - Define nome e descrição
 * - Retorna a strategy de conversão de aspas
 */
export class QuoteConverterTool extends BaseFileTool {
    readonly id = 'quote-converter';
    readonly name = 'Conversor de Aspas';
    readonly description = 'Converte entre aspas simples e duplas em arquivos';
    readonly icon = 'symbol-string';
    readonly category = ToolCategory.TEXT;

    // Strategy tipada como propriedade
    private strategy: QuoteConverterStrategy;

    constructor() {
        super();
        this.strategy = new QuoteConverterStrategy('single-to-double');
    }

    /**
     * Retorna a strategy de conversão de aspas
     */
    protected getStrategy(): IFileProcessingStrategy {
        return this.strategy;
    }

    /**
     * Configuração específica da UI desta tool
     */
    protected getToolConfig(): ToolConfig {
        return {
            icon: 'symbol-string',
            title: this.name,
            description: this.description,
            confirmMessage: '⚠️ ATENÇÃO: Esta ação converterá as aspas dos arquivos selecionados.\n\nDeseja continuar?',
            successMessage: '✅ Aspas convertidas com sucesso!',
            errorMessage: '❌ Erro ao converter aspas',
            buttonText: 'Converter Aspas',
            buttonIcon: 'symbol-string',
            fileExtensions: [
                '.js', '.jsx',
                '.ts', '.tsx',
                '.json',
                '.html',
                '.css',
                '.scss'
            ]
        };
    }
}