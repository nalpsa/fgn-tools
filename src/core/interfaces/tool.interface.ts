export interface ITool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: ToolCategory;
    execute(input: any): Promise<ToolResult>;
}

export interface ToolResult {
    success: boolean;
    output?: any;
    error?: string;
    stats?: { 
        filesProcessed?: number; 
        linesChanged?: number;
        charactersProcessed?: number;
    };
}

export enum ToolCategory {
    CODE = 'code',
    TEXT = 'text', 
    FILE = 'file',
    FORMAT = 'format',
    OTHER = 'other'
}

export interface FileSelectionInput {
    selections: FileSelection[];
    workspacePath: string;
}

export interface FileSelection {
    name: string;
    path: string;
    type: 'file' | 'folder';
    selected: boolean;
}