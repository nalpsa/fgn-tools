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
exports.AnalisadorComplexidadeTool = void 0;
const vscode = __importStar(require("vscode"));
const tool_interface_1 = require("../../core/interfaces/tool.interface");
/**
 * Ferramenta para analisar complexidade ciclomática do código
 */
class AnalisadorComplexidadeTool {
    constructor() {
        this.id = 'analisador-complexidade';
        this.name = 'Analisador de Complexidade';
        this.description = 'Analisa a complexidade ciclomática do código';
        this.icon = '🔍';
        this.category = tool_interface_1.ToolCategory.CODE;
    }
    async execute(input) {
        try {
            // Implementação básica - será expandida posteriormente
            vscode.window.showInformationMessage('Analisador de Complexidade - Em desenvolvimento');
            return {
                success: true,
                output: 'Ferramenta em desenvolvimento',
                stats: {
                    filesProcessed: 0,
                    linesChanged: 0
                }
            };
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
exports.AnalisadorComplexidadeTool = AnalisadorComplexidadeTool;
//# sourceMappingURL=analisador-complexidade.tool.js.map