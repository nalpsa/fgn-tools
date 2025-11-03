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
        this.icon = 'json';
        this.category = tool_interface_1.ToolCategory.FORMATTERS;
    }
    async activate() {
        vscode.window.showInformationMessage('Formatador JSON - Em desenvolvimento');
        // Implementação futura
    }
}
exports.FormatadorJSONTool = FormatadorJSONTool;
//# sourceMappingURL=formatador-json.tool.js.map