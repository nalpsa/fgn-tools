import * as vscode from 'vscode';
import { ToolManagerService } from './core/services/tool-manager.service';
import { ToolboxUIService } from './features/toolbox/toolbox.ui.service';
import { RemoveAllEmptyLinesTool } from './tools/file-tools/remover-todas-linhas-vazias.tool';

// Importar todas as ferramentas
// Ferramentas de Arquivo
import { AjustarLinhasTool } from './tools/file-tools/ajustar-linhas.tool';

// Ferramentas de Texto
import { ContadorTextoTool } from './tools/text-tools/contador-texto.tool';
import { TransformadorCaseTool } from './tools/text-tools/transformador-case.tool';

// Ferramentas de Código
import { AnalisadorComplexidadeTool } from './tools/code-tools/analisador-complexidade.tool';

// Formatadores
import { FormatadorJSONTool } from './tools/formatters/formatador-json.tool';

/**
 * Função de ativação da extensão
 * Chamada quando a extensão é ativada
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 FGN Tools está sendo ativada...');

    // Inicializa os serviços principais
    const toolManager = ToolManagerService.getInstance();
    const toolboxUI = ToolboxUIService.getInstance(context);

    // Registra todas as ferramentas disponíveis
    registerAllTools(toolManager);

    // Registra o comando para abrir o dashboard
    const openDashboardCommand = vscode.commands.registerCommand(
        'fgnTools.openDashboard',
        () => {
            console.log('📦 Abrindo dashboard...');
            toolboxUI.openDashboard();
        }
    );

    // Cria botão na barra de status para acesso rápido
    const statusBarItem = createStatusBarItem();

    // Adiciona os comandos e recursos ao contexto da extensão
    context.subscriptions.push(
        openDashboardCommand,
        statusBarItem
    );

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
function registerAllTools(toolManager: ToolManagerService): void {
    console.log('🔧 Registrando ferramentas...');

    const tools = [
        // Ferramentas de Arquivo
        new AjustarLinhasTool(),
        new RemoveAllEmptyLinesTool(),

        // Ferramentas de Texto
        new TransformadorCaseTool(),
        new ContadorTextoTool(),

        // Ferramentas de Código
        new AnalisadorComplexidadeTool(),

        // Formatadores
        new FormatadorJSONTool(),

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
function createStatusBarItem(): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );

    statusBarItem.text = '$(tools) FGN Tools';
    statusBarItem.tooltip = 'Abrir caixa de ferramentas FGN Tools';
    statusBarItem.command = 'fgnTools.openDashboard';
    statusBarItem.show();

    return statusBarItem;
}

/**
 * Mostra mensagem de boas-vindas
 */
function showWelcomeMessage(): void {
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
export function deactivate() {
    console.log('👋 FGN Tools está sendo desativada...');

    // Limpa recursos se necessário
    const toolManager = ToolManagerService.getInstance();
    toolManager.clearTools();

    console.log('✅ FGN Tools desativada com sucesso!');
}