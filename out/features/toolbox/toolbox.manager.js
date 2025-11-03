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
exports.ToolboxManager = void 0;
const vscode = __importStar(require("vscode"));
const tool_manager_service_1 = require("../../core/services/tool-manager.service");
const toolbox_ui_service_1 = require("./toolbox.ui.service");
class ToolboxManager {
    constructor(context) {
        this.toolManager = new tool_manager_service_1.ToolManager();
        this.toolboxUI = new toolbox_ui_service_1.ToolboxUI(context);
    }
    static getInstance(context) {
        if (!ToolboxManager.instance) {
            ToolboxManager.instance = new ToolboxManager(context);
        }
        return ToolboxManager.instance;
    }
    registerTool(tool) {
        this.toolManager.registerTool(tool);
    }
    async openDashboard() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = await this.toolboxUI.createDashboardPanel(this.toolManager);
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }
    async openToolModal(toolId) {
        const tool = this.toolManager.getTool(toolId);
        if (!tool) {
            vscode.window.showErrorMessage(`Ferramenta não encontrada: ${toolId}`);
            return;
        }
        await this.toolboxUI.createToolModal(tool, this.toolManager);
    }
    getToolManager() {
        return this.toolManager;
    }
}
exports.ToolboxManager = ToolboxManager;
//# sourceMappingURL=toolbox.manager.js.map