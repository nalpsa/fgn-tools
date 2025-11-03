import * as vscode from 'vscode';
import { ITool, ToolCategory } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para analisar complexidade ciclomática do código
 */
export class AnalisadorComplexidadeTool implements ITool {
    public readonly id = 'analisador-complexidade';
    public readonly name = 'Analisador de Complexidade';
    public readonly description = 'Analisa a complexidade ciclomática do código';
    public readonly icon = 'graph-line';
    public readonly category = ToolCategory.CODE;

    public async activate(): Promise<void> {
        vscode.window.showInformationMessage('Analisador de Complexidade - Em desenvolvimento');
        // Implementação futura
    }
}