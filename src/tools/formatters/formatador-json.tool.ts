import * as vscode from 'vscode';
import { ITool, ToolCategory, ToolResult } from '../../core/interfaces/tool.interface';

/**
 * Ferramenta para formatar e validar JSON
 */
export class FormatadorJSONTool implements ITool {
    public readonly id = 'formatador-json';
    public readonly name = 'Formatador JSON';
    public readonly description = 'Formata e valida documentos JSON';
    public readonly icon = '📝';
    public readonly category = ToolCategory.FORMAT;

    async execute(input: any): Promise<ToolResult> {
        try {
            const editor = vscode.window.activeTextEditor;
            
            if (editor) {
                const document = editor.document;
                const text = document.getText();
                
                try {
                    const parsed = JSON.parse(text);
                    const formatted = JSON.stringify(parsed, null, 2);
                    
                    // Aplicar a formatação
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(text.length)
                    );
                    edit.replace(document.uri, fullRange, formatted);
                    
                    await vscode.workspace.applyEdit(edit);
                    await document.save();
                    
                    vscode.window.showInformationMessage('✅ JSON formatado com sucesso!');
                    
                    return {
                        success: true,
                        output: 'JSON formatado com sucesso',
                        stats: {
                            filesProcessed: 1,
                            linesChanged: 0
                        }
                    };
                } catch (parseError) {
                    const errorMsg = 'JSON inválido: ' + (parseError instanceof Error ? parseError.message : String(parseError));
                    vscode.window.showErrorMessage(errorMsg);
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
            } else {
                vscode.window.showErrorMessage('Nenhum editor ativo');
                return {
                    success: false,
                    error: 'Nenhum editor ativo'
                };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}