import * as vscode from 'vscode';
import { ITool, ToolCategory } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para formatar e validar JSON
 */
export class FormatadorJSONTool implements ITool {
    public readonly id = 'formatador-json';
    public readonly name = 'Formatador JSON';
    public readonly description = 'Formata e valida documentos JSON';
    public readonly icon = 'json';
    public readonly category = ToolCategory.FORMATTERS;

    public async activate(): Promise<void> {
        vscode.window.showInformationMessage('Formatador JSON - Em desenvolvimento');
        // Implementação futura
    }
}