import * as vscode from 'vscode';
import { ToolManagerService } from './core/services/tool-manager.service';
import { WebviewManagerService } from './core/services/webview-manager.service';
import { ToolboxUIService } from './features/toolbox/toolbox.ui.service';

// Importar ferramentas
import { AjustarLinhasTool } from './tools/file-tools/ajustar-linhas.tool';
import { RemoverTodasLinhasVaziasTool } from './tools/file-tools/remover-todas-linhas-vazias.tool';

// Importar outras ferramentas conforme forem criadas
// import { TransformadorCaseTool } from './tools/text-tools/transformador-case.tool';
// import { ContadorTextoTool } from './tools/text-tools/contador-texto.tool';
// import { AnalisadorComplexidadeTool } from './tools/code-tools/analisador-complexidade.tool';
// import { FormatadorJSONTool } from './tools/formatters/formatador-json.tool';

/**
 * FunÃ§Ã£o de ativaÃ§Ã£o da extensÃ£o
 * Chamada quando a extensÃ£o Ã© ativada
 * 
 * REFATORADO: Limpo e organizado
 * - Inicializa serviÃ§os
 * - Registra tools
 * - Configura comandos
 * - Cria status bar
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('ðŸš€ FGN Tools estÃ¡ sendo ativada...');

    // ============================================================
    // INICIALIZAR SERVIÃ‡OS
    // ============================================================
    
    const toolManager = ToolManagerService.getInstance();
    const webviewManager = WebviewManagerService.getInstance();
    const toolboxUI = ToolboxUIService.getInstance(context);

    // Inicializar webview manager com contexto
    webviewManager.initialize(context);

    // ============================================================
    // REGISTRAR FERRAMENTAS
    // ============================================================
    
    registerAllTools(toolManager);

    // ============================================================
    // REGISTRAR COMANDOS
    // ============================================================
    
    const openDashboardCommand = vscode.commands.registerCommand(
        'fgnTools.openDashboard',
        () => {
            console.log('ðŸ“¦ Abrindo dashboard...');
            toolboxUI.openDashboard();
        }
    );

    // ============================================================
    // CRIAR STATUS BAR ITEM
    // ============================================================
    
    const statusBarItem = createStatusBarItem();

    // ============================================================
    // REGISTRAR DISPOSABLES
    // ============================================================
    
    context.subscriptions.push(
        openDashboardCommand,
        statusBarItem
    );

    // ============================================================
    // MENSAGEM DE BOAS-VINDAS
    // ============================================================
    
    showWelcomeMessageIfNeeded(context);

    // ============================================================
    // LOG DE SUCESSO
    // ============================================================
    
    const totalTools = toolManager.getToolCount();
    console.log('âœ… FGN Tools ativada com sucesso!');
    console.log(`ðŸ“Š Total de ferramentas registradas: ${totalTools}`);
    console.log(`ðŸŽ¨ Categorias disponÃ­veis: ${toolManager.getAllCategoryMetadata().length}`);
}

/**
 * Registra todas as ferramentas disponÃ­veis
 * Seguindo o PrincÃ­pio Aberto/Fechado: fÃ¡cil adicionar novas ferramentas
 * 
 * Para adicionar uma nova tool:
 * 1. Importar a tool no topo do arquivo
 * 2. Adicionar instÃ¢ncia no array abaixo
 * 3. Pronto! A tool aparecerÃ¡ automaticamente no dashboard
 */
function registerAllTools(toolManager: ToolManagerService): void {
    console.log('ðŸ”§ Registrando ferramentas...');

    const tools = [
        // ========================================
        // FERRAMENTAS DE ARQUIVO (File Tools)
        // ========================================
        new AjustarLinhasTool(),
        new RemoverTodasLinhasVaziasTool(),

        // ========================================
        // FERRAMENTAS DE TEXTO (Text Tools)
        // ========================================
        // new TransformadorCaseTool(),
        // new ContadorTextoTool(),
        // new LoremIpsumTool(),

        // ========================================
        // FERRAMENTAS DE CÃ“DIGO (Code Tools)
        // ========================================
        // new AnalisadorComplexidadeTool(),
        // new ExtratorDependenciasTool(),
        // new GeradorDiagramasTool(),
        // new RemoverComentariosTool(),

        // ========================================
        // FORMATADORES (Formatters)
        // ========================================
        // new FormatadorJSONTool(),
        // new FormatadorSQLTool(),
        // new OrganizadorCSSTool(),
        // new FormatadorMarkdownTool(),

        // ========================================
        // OUTRAS FERRAMENTAS (Other Tools)
        // ========================================
        // new ConversorBaseTool(),
        // new GeradorQRCodeTool(),
        // new ManipuladorTimestampTool(),
    ];

    toolManager.registerTools(tools);

    console.log(`âœ… ${tools.length} ferramenta(s) registrada(s) com sucesso!`);
}

/**
 * Cria o item na barra de status
 */
function createStatusBarItem(): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );

    statusBarItem.text = '$(tools) FGN Tools';
    statusBarItem.tooltip = 'Abrir caixa de ferramentas FGN Tools';
    statusBarItem.command = 'fgnTools.openDashboard';
    statusBarItem.backgroundColor = undefined; // Cor padrÃ£o
    statusBarItem.show();

    return statusBarItem;
}

/**
 * Mostra mensagem de boas-vindas (apenas na primeira vez)
 */
function showWelcomeMessageIfNeeded(context: vscode.ExtensionContext): void {
    const hasShownWelcome = context.globalState.get('fgnTools.hasShownWelcome', false);
    
    if (!hasShownWelcome) {
        const message = 'ðŸ‘‹ Bem-vindo ao FGN Tools! ðŸ› ï¸';
        const action = 'Abrir Dashboard';

        vscode.window.showInformationMessage(message, action).then(selection => {
            if (selection === action) {
                vscode.commands.executeCommand('fgnTools.openDashboard');
            }
        });

        // Marcar como jÃ¡ mostrado
        context.globalState.update('fgnTools.hasShownWelcome', true);
    }
}

/**
 * FunÃ§Ã£o de desativaÃ§Ã£o da extensÃ£o
 * Chamada quando a extensÃ£o Ã© desativada
 */
export function deactivate() {
    console.log('ðŸ‘‹ FGN Tools estÃ¡ sendo desativada...');

    // Limpar recursos
    const toolManager = ToolManagerService.getInstance();
    const webviewManager = WebviewManagerService.getInstance();

    // Limpar tools
    toolManager.clearTools();

    // Fechar todos os webviews
    webviewManager.disposeAll();

    console.log('âœ… FGN Tools desativada com sucesso!');
}