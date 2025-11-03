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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const toolbox_manager_1 = require("./features/toolbox/toolbox.manager");
const adjust_empty_lines_tool_1 = require("./features/line-tools/adjust-empty-lines.tool");
const remove_all_empty_lines_tool_1 = require("./features/line-tools/remove-all-empty-lines.tool");
let toolboxManager;
function activate(context) {
    console.log('✅ FGN Tools - Extensão ativada');
    // Inicializa o sistema de toolbox
    toolboxManager = toolbox_manager_1.ToolboxManager.getInstance(context);
    // Registra todas as ferramentas
    registerTools();
    // Configura comandos
    setupCommands(context);
    console.log('🎯 FGN Tools - Todas as ferramentas registradas');
}
function registerTools() {
    // Ferramentas de Linha
    toolboxManager.registerTool(new adjust_empty_lines_tool_1.AdjustEmptyLinesTool());
    toolboxManager.registerTool(new remove_all_empty_lines_tool_1.RemoveAllEmptyLinesTool());
    // TODO: Registrar outras ferramentas aqui
    // toolboxManager.registerTool(new FormatJsonTool());
    // toolboxManager.registerTool(new MinifyCssTool());
    // etc...
}
function setupCommands(context) {
    // Comando principal - Dashboard
    const dashboardCommand = vscode.commands.registerCommand('fgnTools.dashboard', () => {
        toolboxManager.openDashboard();
    });
    // Comando legado - mantém compatibilidade
    const legacyCommand = vscode.commands.registerCommand('ajustarLinhas.iniciar', () => {
        toolboxManager.openToolModal('adjust-empty-lines');
    });
    // Botão na status bar
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = `🛠️ FGN Tools`;
    statusBar.tooltip = "Abrir caixa de ferramentas";
    statusBar.command = "fgnTools.dashboard";
    statusBar.show();
    context.subscriptions.push(dashboardCommand, legacyCommand, statusBar);
}
function deactivate() {
    console.log('🔴 FGN Tools - Extensão desativada');
}
//# sourceMappingURL=extension.js.map