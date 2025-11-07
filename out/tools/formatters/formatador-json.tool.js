"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatadorJSONTool = void 0;
const vscode = __importStar(require("vscode"));
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para formatar e validar JSON
 */
class FormatadorJSONTool {
    constructor() {
        this.id = 'formatador-json';
        this.name = 'Formatador JSON';
        this.description = 'Formata e valida documentos JSON';
        this.icon = '📝';
        this.category = tool_interface_1.ToolCategory.FORMAT;
    }
    async execute(input) {
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
                    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
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
                }
                catch (parseError) {
                    const errorMsg = 'JSON inválido: ' + (parseError instanceof Error ? parseError.message : String(parseError));
                    vscode.window.showErrorMessage(errorMsg);
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
            }
            else {
                vscode.window.showErrorMessage('Nenhum editor ativo');
                return {
                    success: false,
                    error: 'Nenhum editor ativo'
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}
exports.FormatadorJSONTool = FormatadorJSONTool;
//# sourceMappingURL=formatador-json.tool.js.map