import { IFileProcessingStrategy, ProcessResult } from '../interfaces/file-processor.interface';

/**
 * Métricas de complexidade de uma função
 */
export interface FunctionComplexity {
    name: string;
    line: number;
    cyclomaticComplexity: number;
    linesOfCode: number;
    parameters: number;
    nestingDepth: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Resultado estendido com análise de complexidade
 */
export interface ComplexityAnalysisResult extends ProcessResult {
    functions?: FunctionComplexity[];
    averageComplexity?: number;
    maxComplexity?: number;
    totalFunctions?: number;
}

/**
 * Strategy para análise de complexidade ciclomática
 * Implementa IFileProcessingStrategy
 * 
 * Responsabilidade: Calcular complexidade do código
 * - Complexidade ciclomática (McCabe)
 * - Profundidade de aninhamento
 * - Linhas de código por função
 * - Número de parâmetros
 * - Classificação de risco
 */
export class ComplexityAnalyzerStrategy implements IFileProcessingStrategy {
    
    /**
     * Retorna o nome da strategy
     */
    getName(): string {
        return 'Complexity Analyzer Strategy';
    }

    /**
     * Processa o conteúdo analisando complexidade
     */
    processFile(content: string): ComplexityAnalysisResult {
        const lines = content.split('\n');
        const totalLines = lines.length;
        const functions = this.extractFunctions(content);

        const averageComplexity = functions.length > 0
            ? functions.reduce((sum, f) => sum + f.cyclomaticComplexity, 0) / functions.length
            : 0;

        const maxComplexity = functions.length > 0
            ? Math.max(...functions.map(f => f.cyclomaticComplexity))
            : 0;

        return {
            content, // Não modifica o conteúdo
            linesChanged: 0, // Apenas análise
            functions,
            averageComplexity: Number(averageComplexity.toFixed(2)),
            maxComplexity,
            totalFunctions: functions.length
        };
    }

    /**
     * Extrai funções e calcula suas complexidades
     */
    public extractFunctions(content: string): FunctionComplexity[] {
        const functions: FunctionComplexity[] = [];
        const lines = content.split('\n');

        // Padrões para detectar funções
        const functionPatterns = [
            /function\s+(\w+)\s*\(([^)]*)\)/,  // function name()
            /(\w+)\s*=\s*function\s*\(([^)]*)\)/,  // name = function()
            /(\w+)\s*:\s*function\s*\(([^)]*)\)/,  // name: function()
            /(\w+)\s*=\s*\(([^)]*)\)\s*=>/,  // name = () =>
            /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/,  // const name = () =>
            /async\s+function\s+(\w+)\s*\(([^)]*)\)/,  // async function name()
            /(\w+)\s*\(([^)]*)\)\s*{/,  // name() {  (métodos)
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            for (const pattern of functionPatterns) {
                const match = line.match(pattern);
                
                if (match) {
                    const name = match[1];
                    const params = match[2] || '';
                    const paramCount = params.trim() ? params.split(',').length : 0;

                    // Extrair corpo da função
                    const functionBody = this.extractFunctionBody(lines, i);
                    
                    if (functionBody.lines.length > 0) {
                        const complexity = this.calculateComplexity(functionBody.lines);
                        const nestingDepth = this.calculateNestingDepth(functionBody.lines);
                        const risk = this.calculateRisk(complexity, nestingDepth, functionBody.lines.length, paramCount);

                        functions.push({
                            name,
                            line: i + 1,
                            cyclomaticComplexity: complexity,
                            linesOfCode: functionBody.lines.length,
                            parameters: paramCount,
                            nestingDepth,
                            risk
                        });
                    }

                    break; // Encontrou uma função nesta linha
                }
            }
        }

        return functions;
    }

    /**
     * Extrai o corpo de uma função a partir da linha de declaração
     */
    public extractFunctionBody(lines: string[], startLine: number): { lines: string[] } {
        const body: string[] = [];
        let braceCount = 0;
        let started = false;

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            // Contar chaves
            for (const char of line) {
                if (char === '{') {
                    braceCount++;
                    started = true;
                } else if (char === '}') {
                    braceCount--;
                }
            }

            if (started) {
                body.push(line);
            }

            // Terminou a função
            if (started && braceCount === 0) {
                break;
            }

            // Limite de segurança
            if (body.length > 1000) break;
        }

        return { lines: body };
    }

    /**
     * Calcula complexidade ciclomática
     * 
     * Complexidade = 1 + número de pontos de decisão
     * Pontos de decisão: if, else if, for, while, case, catch, &&, ||, ?
     */
    public calculateComplexity(lines: string[]): number {
        let complexity = 1; // Complexidade base

        const code = lines.join('\n');

        // Contar pontos de decisão
        const patterns = [
            /\bif\s*\(/g,           // if (
            /\belse\s+if\s*\(/g,    // else if (
            /\bfor\s*\(/g,          // for (
            /\bwhile\s*\(/g,        // while (
            /\bcase\s+/g,           // case
            /\bcatch\s*\(/g,        // catch (
            /\?\s*[^:]+\s*:/g,      // ternary ? :
            /&&/g,                  // logical AND
            /\|\|/g,                // logical OR
        ];

        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });

        return complexity;
    }

    /**
     * Calcula profundidade máxima de aninhamento
     */
    public calculateNestingDepth(lines: string[]): number {
        let maxDepth = 0;
        let currentDepth = 0;

        lines.forEach(line => {
            // Incrementar ao abrir bloco
            const openBraces = (line.match(/{/g) || []).length;
            currentDepth += openBraces;
            
            if (currentDepth > maxDepth) {
                maxDepth = currentDepth;
            }

            // Decrementar ao fechar bloco
            const closeBraces = (line.match(/}/g) || []).length;
            currentDepth -= closeBraces;
        });

        return maxDepth;
    }

    /**
     * Calcula nível de risco baseado nas métricas
     * 
     * Baseado em:
     * - Complexidade ciclomática (McCabe)
     * - Profundidade de aninhamento
     * - Linhas de código
     * - Número de parâmetros
     */
    public calculateRisk(
        complexity: number,
        nestingDepth: number,
        linesOfCode: number,
        parameters: number
    ): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
        let riskScore = 0;

        // Complexidade ciclomática (peso 40%)
        if (complexity <= 5) riskScore += 0;
        else if (complexity <= 10) riskScore += 4;
        else if (complexity <= 20) riskScore += 8;
        else riskScore += 12;

        // Profundidade de aninhamento (peso 30%)
        if (nestingDepth <= 2) riskScore += 0;
        else if (nestingDepth <= 4) riskScore += 3;
        else if (nestingDepth <= 6) riskScore += 6;
        else riskScore += 9;

        // Linhas de código (peso 20%)
        if (linesOfCode <= 25) riskScore += 0;
        else if (linesOfCode <= 50) riskScore += 2;
        else if (linesOfCode <= 100) riskScore += 4;
        else riskScore += 6;

        // Número de parâmetros (peso 10%)
        if (parameters <= 3) riskScore += 0;
        else if (parameters <= 5) riskScore += 1;
        else if (parameters <= 7) riskScore += 2;
        else riskScore += 3;

        // Classificar risco
        if (riskScore <= 5) return 'LOW';
        if (riskScore <= 12) return 'MEDIUM';
        if (riskScore <= 20) return 'HIGH';
        return 'VERY_HIGH';
    }

    /**
     * Gera relatório de complexidade
     */
    public generateReport(functions: FunctionComplexity[], filePath: string): string {
        if (functions.length === 0) {
            return `📄 ${filePath}\n   ✅ Nenhuma função encontrada\n`;
        }

        let report = `📄 ${filePath} (${functions.length} funções)\n\n`;

        // Ordenar por complexidade (maior primeiro)
        const sorted = [...functions].sort((a, b) => b.cyclomaticComplexity - a.cyclomaticComplexity);

        sorted.forEach(func => {
            const riskIcon = this.getRiskIcon(func.risk);
            report += `  ${riskIcon} ${func.name}() - Linha ${func.line}\n`;
            report += `     Complexidade: ${func.cyclomaticComplexity}\n`;
            report += `     Linhas: ${func.linesOfCode} | Parâmetros: ${func.parameters} | Aninhamento: ${func.nestingDepth}\n`;
            report += `     Risco: ${func.risk}\n\n`;
        });

        return report;
    }

    /**
     * Retorna ícone para o nível de risco
     */
    private getRiskIcon(risk: FunctionComplexity['risk']): string {
        const icons = {
            'LOW': '✅',
            'MEDIUM': '⚠️',
            'HIGH': '🔴',
            'VERY_HIGH': '🚨'
        };
        return icons[risk];
    }
}