import * as vscode from 'vscode';
import { ToolConfig, ToolResult, ToolCategory } from '../../core/interfaces/tool.interface';
import { IFileProcessingStrategy, FileSelectionInput } from '../../core/interfaces/file-processor.interface';
import { BaseFileTool } from '../../features/tools/base/base-file-tool';
import { ComplexityAnalyzerStrategy, FunctionComplexity } from '../../core/strategies/complexity-analyzer.strategy';

/**
 * Tool para análise de complexidade de código
 * Herda de BaseFileTool mas sobrescreve processFiles para gerar relatório
 * 
 * Responsabilidade: Analisar e reportar complexidade
 * - Define ID, nome, descrição
 * - Retorna strategy de análise
 * - Gera relatório consolidado
 * - Identifica funções de alto risco
 */
export class ComplexityAnalyzerTool extends BaseFileTool {
    readonly id = 'complexity-analyzer';
    readonly name = 'Analisador de Complexidade';
    readonly description = 'Analisa a complexidade ciclomática e métricas de qualidade do código';
    readonly icon = 'graph';
    readonly category = ToolCategory.CODE;

    // Strategy tipada como propriedade
    private strategy: ComplexityAnalyzerStrategy;

    constructor() {
        super();
        this.strategy = new ComplexityAnalyzerStrategy();
    }

    /**
     * Retorna a strategy de análise de complexidade
     */
    protected getStrategy(): IFileProcessingStrategy {
        return this.strategy;
    }

    /**
     * Configuração da UI
     */
    protected getToolConfig(): ToolConfig {
        return {
            icon: 'graph',
            title: this.name,
            description: this.description,
            confirmMessage: '📊 Esta ação analisará a complexidade dos arquivos selecionados.\n\nDeseja continuar?',
            successMessage: '✅ Análise de complexidade concluída!',
            errorMessage: '❌ Erro ao analisar complexidade',
            buttonText: 'Analisar Complexidade',
            buttonIcon: 'graph',
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
                '.kt'
            ]
        };
    }

    /**
     * Sobrescreve processFiles para gerar relatório de complexidade
     */
    protected async processFiles(input: FileSelectionInput): Promise<ToolResult> {
        const workspacePath = this.workspaceService.getWorkspaceRoot();
        
        if (!workspacePath) {
            return {
                success: false,
                error: 'Nenhum workspace aberto'
            };
        }

        console.log(`📊 ${this.name} - Analisando arquivos...`);

        let totalFunctions = 0;
        let highRiskFunctions = 0;
        const allAnalysis: Array<{ file: string; functions: FunctionComplexity[] }> = [];

        try {
            // Processar cada seleção
            for (const selection of input.selections) {
                if (!selection.selected) continue;

                const fullPath = `${workspacePath}/${selection.path}`;

                if (selection.type === 'folder') {
                    // Processar pasta recursivamente
                    await this.processFolderForComplexity(fullPath, allAnalysis);
                } else {
                    // Processar arquivo único
                    await this.processSingleFileForComplexity(fullPath, selection.path, allAnalysis);
                }
            }

            // Calcular estatísticas
            allAnalysis.forEach(item => {
                totalFunctions += item.functions.length;
                highRiskFunctions += item.functions.filter(f => f.risk === 'HIGH' || f.risk === 'VERY_HIGH').length;
            });

            // Gerar relatório
            const report = this.generateFullReport(allAnalysis, totalFunctions, highRiskFunctions);

            // Salvar relatório em arquivo
            await this.saveReport(report, workspacePath);

            console.log(`✅ Análise concluída: ${totalFunctions} funções analisadas`);

            return {
                success: true,
                output: report,
                stats: {
                    filesProcessed: allAnalysis.length,
                    totalFunctions,
                    highRiskFunctions
                }
            };

        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`❌ Erro na análise:`, errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Processa pasta recursivamente analisando complexidade
     */
    private async processFolderForComplexity(
        folderPath: string,
        allAnalysis: Array<{ file: string; functions: FunctionComplexity[] }>
    ): Promise<void> {
        const config = this.getToolConfig();
        
        await this.fileSystemService.processFolder(
            folderPath,
            async (filePath) => {
                const relativePath = this.workspaceService.asRelativePath(filePath);
                await this.processSingleFileForComplexity(filePath, relativePath, allAnalysis);
            },
            {
                includeExtensions: config.fileExtensions
            }
        );
    }

    /**
     * Processa um único arquivo analisando complexidade
     */
    private async processSingleFileForComplexity(
        filePath: string,
        relativePath: string,
        allAnalysis: Array<{ file: string; functions: FunctionComplexity[] }>
    ): Promise<void> {
        try {
            const content = await this.fileSystemService.readFile(filePath);
            const result = this.strategy.processFile(content);
            
            if (result.functions && result.functions.length > 0) {
                allAnalysis.push({
                    file: relativePath,
                    functions: result.functions
                });
            }
        } catch (error) {
            console.error(`Erro ao processar ${relativePath}:`, error);
        }
    }

    /**
     * Gera relatório completo de complexidade
     */
    private generateFullReport(
        allAnalysis: Array<{ file: string; functions: FunctionComplexity[] }>,
        totalFunctions: number,
        highRiskFunctions: number
    ): string {
        let report = '═══════════════════════════════════════════\n';
        report += '  📊 RELATÓRIO DE ANÁLISE DE COMPLEXIDADE\n';
        report += '═══════════════════════════════════════════\n\n';
        
        // Resumo geral
        const allFunctions = allAnalysis.flatMap(a => a.functions);
        const avgComplexity = allFunctions.length > 0
            ? (allFunctions.reduce((sum, f) => sum + f.cyclomaticComplexity, 0) / allFunctions.length).toFixed(2)
            : '0';
        const maxComplexity = allFunctions.length > 0
            ? Math.max(...allFunctions.map(f => f.cyclomaticComplexity))
            : 0;

        report += `📈 Resumo Geral:\n`;
        report += `   • Total de funções analisadas: ${totalFunctions}\n`;
        report += `   • Complexidade média: ${avgComplexity}\n`;
        report += `   • Complexidade máxima: ${maxComplexity}\n`;
        report += `   • Funções de alto risco: ${highRiskFunctions}\n`;
        report += `   • Arquivos analisados: ${allAnalysis.length}\n\n`;

        if (totalFunctions === 0) {
            report += '✅ Nenhuma função encontrada para análise!\n';
            return report;
        }

        // Funções de maior risco
        const highRisk = allFunctions
            .filter(f => f.risk === 'HIGH' || f.risk === 'VERY_HIGH')
            .sort((a, b) => b.cyclomaticComplexity - a.cyclomaticComplexity);

        if (highRisk.length > 0) {
            report += '🚨 FUNÇÕES DE ALTO RISCO (requerem refatoração):\n\n';
            highRisk.forEach(func => {
                const file = allAnalysis.find(a => a.functions.includes(func))?.file || 'unknown';
                report += `   ${func.risk === 'VERY_HIGH' ? '🚨' : '🔴'} ${func.name}() - ${file}:${func.line}\n`;
                report += `      Complexidade: ${func.cyclomaticComplexity} | LOC: ${func.linesOfCode} | Params: ${func.parameters}\n`;
            });
            report += '\n';
        }

        report += '───────────────────────────────────────────\n\n';

        // Relatório detalhado por arquivo
        allAnalysis.forEach(item => {
            if (item.functions.length > 0) {
                report += this.strategy.generateReport(item.functions, item.file);
            }
        });

        report += '═══════════════════════════════════════════\n';
        report += '\n📚 Referência de Complexidade Ciclomática:\n';
        report += '   1-5:   ✅ Baixa      (código simples e testável)\n';
        report += '   6-10:  ⚠️  Moderada  (considerar simplificar)\n';
        report += '   11-20: 🔴 Alta      (refatoração recomendada)\n';
        report += '   21+:   🚨 Muito Alta (refatoração urgente)\n';

        return report;
    }

    /**
     * Salva relatório em arquivo
     */
    private async saveReport(report: string, workspacePath: string): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const reportPath = `${workspacePath}/COMPLEXITY-REPORT-${timestamp}.txt`;
        
        try {
            await this.fileSystemService.writeFile(reportPath, report);
            console.log(`📄 Relatório salvo em: ${reportPath}`);
            
            // Abrir o relatório no editor
            const uri = vscode.Uri.file(reportPath);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
            
        } catch (error) {
            console.error('Erro ao salvar relatório:', error);
        }
    }
}