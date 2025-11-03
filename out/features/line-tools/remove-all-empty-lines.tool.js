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
exports.RemoveAllEmptyLinesTool = void 0;
const tool_interface_1 = require("../../core/interfaces/tool.interface");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RemoveAllEmptyLinesTool {
    constructor() {
        this.id = 'remove-all-empty-lines';
        this.name = 'Remover Todas Linhas Vazias';
        this.description = 'Remove completamente todas as linhas em branco';
        this.icon = '🚫';
        this.category = tool_interface_1.ToolCategory.CODE;
    }
    async execute(input) {
        try {
            let totalArquivos = 0;
            let totalLinhasRemovidas = 0;
            for (const selection of input.selections) {
                if (selection.selected) {
                    const fullPath = path.join(input.workspacePath, selection.path);
                    if (selection.type === 'folder') {
                        const resultado = await this.processarPasta(fullPath);
                        totalArquivos += resultado.arquivos;
                        totalLinhasRemovidas += resultado.linhas;
                    }
                    else {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            totalArquivos++;
                            totalLinhasRemovidas += resultado.linhasRemovidas;
                        }
                    }
                }
            }
            return {
                success: true,
                stats: {
                    filesProcessed: totalArquivos,
                    linesChanged: totalLinhasRemovidas
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Erro ao processar: ${error}`
            };
        }
    }
    async processarPasta(pastaPath) {
        let arquivos = 0;
        let linhas = 0;
        const processarRecursivo = async (dir) => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await processarRecursivo(fullPath);
                    }
                    else if (this.isArquivoTexto(entry.name)) {
                        const resultado = await this.processarArquivo(fullPath);
                        if (resultado) {
                            arquivos++;
                            linhas += resultado.linhasRemovidas;
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro ao processar pasta:', error);
            }
        };
        await processarRecursivo(pastaPath);
        return { arquivos, linhas };
    }
    async processarArquivo(filePath) {
        try {
            const conteudo = await fs.promises.readFile(filePath, 'utf-8');
            const linhas = conteudo.split('\n');
            const novasLinhas = [];
            let linhasRemovidas = 0;
            // LÓGICA SIMPLES: Remove TODAS as linhas vazias
            for (const linha of linhas) {
                if (linha.trim() !== '') {
                    novasLinhas.push(linha);
                }
                else {
                    linhasRemovidas++;
                }
            }
            const novoConteudo = novasLinhas.join('\n');
            if (linhasRemovidas > 0) {
                await fs.promises.writeFile(filePath, novoConteudo, 'utf-8');
            }
            return { linhasRemovidas };
        }
        catch (error) {
            console.error(`❌ Erro no arquivo ${filePath}:`, error);
            return null;
        }
    }
    isArquivoTexto(nome) {
        const extensoes = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', '.py', '.java', '.cpp', '.c', '.php', '.xml', '.yaml', '.yml'];
        return extensoes.some(ext => nome.toLowerCase().endsWith(ext));
    }
}
exports.RemoveAllEmptyLinesTool = RemoveAllEmptyLinesTool;
//# sourceMappingURL=remove-all-empty-lines.tool.js.map