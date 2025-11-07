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
const tool_manager_service_1 = require("./core/services/tool-manager.service");
const toolbox_ui_service_1 = require("./features/toolbox/toolbox.ui.service");
const remover_todas_linhas_vazias_tool_1 = require("./tools/file-tools/remover-todas-linhas-vazias.tool");
// Importar todas as ferramentas
// Ferramentas de Arquivo
const ajustar_linhas_tool_1 = require("./tools/file-tools/ajustar-linhas.tool");
// Ferramentas de Texto
const contador_texto_tool_1 = require("./tools/text-tools/contador-texto.tool");
const transformador_case_tool_1 = require("./tools/text-tools/transformador-case.tool");
// Ferramentas de Código
const analisador_complexidade_tool_1 = require("./tools/code-tools/analisador-complexidade.tool");
// Formatadores
const formatador_json_tool_1 = require("./tools/formatters/formatador-json.tool");
/**
 * Função de ativação da extensão
 * Chamada quando a extensão é ativada
 */
function activate(context) {
    console.log('🚀 FGN Tools está sendo ativada...');
    // Inicializa os serviços principais
    const toolManager = tool_manager_service_1.ToolManagerService.getInstance();
    const toolboxUI = toolbox_ui_service_1.ToolboxUIService.getInstance(context);
    // Registra todas as ferramentas disponíveis
    registerAllTools(toolManager);
    // Registra o comando para abrir o dashboard
    const openDashboardCommand = vscode.commands.registerCommand('fgnTools.openDashboard', () => {
        console.log('📦 Abrindo dashboard...');
        toolboxUI.openDashboard();
    });
    // Cria botão na barra de status para acesso rápido
    const statusBarItem = createStatusBarItem();
    // Adiciona os comandos e recursos ao contexto da extensão
    context.subscriptions.push(openDashboardCommand, statusBarItem);
    // Log de sucesso
    console.log('✅ FGN Tools ativada com sucesso!');
    console.log(`📊 Total de ferramentas registradas: ${toolManager.getAllTools().length}`);
    // Mostra mensagem de boas-vindas (apenas na primeira vez)
    const hasShownWelcome = context.globalState.get('fgnTools.hasShownWelcome', false);
    if (!hasShownWelcome) {
        showWelcomeMessage();
        context.globalState.update('fgnTools.hasShownWelcome', true);
    }
}
/**
 * Registra todas as ferramentas disponíveis
 * Seguindo o Princípio Aberto/Fechado: fácil adicionar novas ferramentas
 */
function registerAllTools(toolManager) {
    console.log('🔧 Registrando ferramentas...');
    const tools = [
        // Ferramentas de Arquivo
        new ajustar_linhas_tool_1.AjustarLinhasTool(),
        new remover_todas_linhas_vazias_tool_1.RemoveAllEmptyLinesTool(),
        // Ferramentas de Texto
        new transformador_case_tool_1.TransformadorCaseTool(),
        new contador_texto_tool_1.ContadorTextoTool(),
        // Ferramentas de Código
        new analisador_complexidade_tool_1.AnalisadorComplexidadeTool(),
        // Formatadores
        new formatador_json_tool_1.FormatadorJSONTool(),
        // ========================================
        // Adicione mais ferramentas aqui conforme forem sendo criadas:
        // ========================================
        // Ferramentas de Código:
        // new ExtratorDependenciasTool(),
        // new GeradorDiagramasTool(),
        // Ferramentas de Texto:
        // new LoremIpsumTool(),
        // Ferramentas de Arquivo:
        // new ComparadorArquivosTool(),
        // new ValidadorXMLTool(),
        // new GeradorHashTool(),
        // Formatadores:
        // new FormatadorSQLTool(),
        // new OrganizadorCSSTool(),
        // new FormatadorMarkdownTool(),
        // Outras Ferramentas:
        // new ConversorBaseTool(),
        // new GeradorQRCodeTool(),
        // new ManipuladorTimestampTool(),
    ];
    toolManager.registerTools(tools);
    console.log(`✅ ${tools.length} ferramenta(s) registrada(s) com sucesso!`);
}
/**
 * Cria o botão na barra de status
 */
function createStatusBarItem() {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(tools) FGN Tools';
    statusBarItem.tooltip = 'Abrir caixa de ferramentas FGN Tools';
    statusBarItem.command = 'fgnTools.openDashboard';
    statusBarItem.show();
    return statusBarItem;
}
/**
 * Mostra mensagem de boas-vindas
 */
function showWelcomeMessage() {
    const message = 'Bem-vindo ao FGN Tools! 🛠️';
    const action = 'Abrir Dashboard';
    vscode.window.showInformationMessage(message, action).then(selection => {
        if (selection === action) {
            vscode.commands.executeCommand('fgnTools.openDashboard');
        }
    });
}
/**
 * Função de desativação da extensão
 * Chamada quando a extensão é desativada
 */
function deactivate() {
    console.log('👋 FGN Tools está sendo desativada...');
    // Limpa recursos se necessário
    const toolManager = tool_manager_service_1.ToolManagerService.getInstance();
    toolManager.clearTools();
    console.log('✅ FGN Tools desativada com sucesso!');
}
//# sourceMappingURL=extension.js.map