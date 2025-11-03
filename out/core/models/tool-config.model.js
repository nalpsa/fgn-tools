"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolboxState = exports.ToolConfig = void 0;
class ToolConfig {
    constructor(enabled = true, position, settings = {}) {
        this.enabled = enabled;
        this.position = position;
        this.settings = settings;
    }
}
exports.ToolConfig = ToolConfig;
class ToolboxState {
    constructor(tools = new Map(), isMinimized = false, lastPosition) {
        this.tools = tools;
        this.isMinimized = isMinimized;
        this.lastPosition = lastPosition;
    }
}
exports.ToolboxState = ToolboxState;
//# sourceMappingURL=tool-config.model.js.map