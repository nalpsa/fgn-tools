import * as vscode from 'vscode';
import { ToolboxManager } from './features/toolbox/toolbox.manager';
import { AdjustEmptyLinesTool } from './features/line-tools/adjust-empty-lines.tool';
import { RemoveAllEmptyLinesTool } from './features/line-tools/remove-all-empty-lines.tool';

let toolboxManager: ToolboxManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ FGN Tools - Extensão ativada');

    // Inicializa o sistema de toolbox
    toolboxManager = ToolboxManager.getInstance(context);

    // Registra todas as ferramentas
    registerTools();

    // Configura comandos
    setupCommands(context);

    console.log('🎯 FGN Tools - Todas as ferramentas registradas');
}

function registerTools(): void {
    // Ferramentas de Linha
    toolboxManager.registerTool(new AdjustEmptyLinesTool());
    toolboxManager.registerTool(new RemoveAllEmptyLinesTool());
    
    // TODO: Registrar outras ferramentas aqui
    // toolboxManager.registerTool(new FormatJsonTool());
    // toolboxManager.registerTool(new MinifyCssTool());
    // etc...
}

function setupCommands(context: vscode.ExtensionContext): void {
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

    context.subscriptions.push(
        dashboardCommand,
        legacyCommand,
        statusBar
    );
}

export function deactivate() {
    console.log('🔴 FGN Tools - Extensão desativada');
}