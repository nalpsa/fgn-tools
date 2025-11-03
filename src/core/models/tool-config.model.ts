export class ToolConfig {
    constructor(
        public enabled: boolean = true,
        public position?: { x: number; y: number },
        public settings: Record<string, any> = {}
    ) {}
}

export class ToolboxState {
    constructor(
        public tools: Map<string, ToolConfig> = new Map(),
        public isMinimized: boolean = false,
        public lastPosition?: { x: number; y: number }
    ) {}
}