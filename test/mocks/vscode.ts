// Minimal in-memory implementation of the VS Code API surface used by the extension.
// Aliased as the 'vscode' module by vitest.config.ts so the sources run in plain Node.

type Listener = (...args: any[]) => any;

export class Disposable {
  constructor(private callOnDispose: () => any = () => undefined) {}
  static from(...disposables: { dispose(): any }[]): Disposable {
    return new Disposable(() => disposables.forEach((d) => d.dispose()));
  }
  dispose(): any {
    return this.callOnDispose();
  }
}

export class EventEmitter<T> {
  private listeners: Listener[] = [];
  event = (listener: (e: T) => any): Disposable => {
    this.listeners.push(listener);
    return new Disposable(() => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    });
  };
  fire(data?: T): void {
    this.listeners.forEach((l) => l(data));
  }
  dispose(): void {
    this.listeners = [];
  }
}

export class Position {
  constructor(
    public line: number,
    public character: number
  ) {}
}

export class Range {
  constructor(
    public start: Position,
    public end: Position
  ) {}
}

export class Uri {
  private constructor(private value: string) {}
  static parse(value: string): Uri {
    return new Uri(value);
  }
  static file(path: string): Uri {
    return new Uri(`file://${path}`);
  }
  get fsPath(): string {
    return this.value;
  }
  toString(): string {
    return this.value;
  }
}

export class DocumentLink {
  constructor(
    public range: Range,
    public target?: Uri
  ) {}
}

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2,
}

export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}

export class TreeItem {
  label?: string;
  tooltip?: string;
  command?: any;
  contextValue?: string;
  constructor(
    label: string,
    public collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None
  ) {
    this.label = label;
  }
}

// ---------- configuration ----------
const configStore = new Map<string, any>();

export const __mock = {
  configStore,
  reset(): void {
    configStore.clear();
  },
};

const getConfiguration = (section?: string) => {
  const prefix = section ? `${section}.` : '';
  const config: any = {};
  for (const [key, value] of configStore) {
    if (key.startsWith(prefix)) {
      config[key.slice(prefix.length)] = value;
    }
  }
  config.get = (key: string, defaultValue?: any) =>
    configStore.has(prefix + key) ? configStore.get(prefix + key) : defaultValue;
  config.has = (key: string) => configStore.has(prefix + key);
  config.inspect = () => undefined;
  config.update = async (key: string, value: any) => {
    if (value === undefined) {
      configStore.delete(prefix + key);
    } else {
      configStore.set(prefix + key, value);
    }
  };
  return config;
};

export const workspace = {
  workspaceFolders: undefined as any,
  getConfiguration,
  onDidChangeConfiguration: (_listener: Listener): Disposable => new Disposable(),
  openTextDocument: async (options: { content?: string; language?: string } = {}) => ({
    languageId: options.language || 'plaintext',
    getText: () => options.content || '',
  }),
};

// ---------- window ----------
const createStatusBarItem = (alignment?: StatusBarAlignment, priority?: number) => ({
  alignment,
  priority,
  text: '',
  tooltip: '',
  command: undefined as any,
  show: () => undefined,
  hide: () => undefined,
  dispose: () => undefined,
});

const createOutputChannel = (name: string) => ({
  name,
  append: (_value: string) => undefined,
  appendLine: (_value: string) => undefined,
  clear: () => undefined,
  show: () => undefined,
  hide: () => undefined,
  dispose: () => undefined,
});

export const window = {
  state: { focused: true },
  activeTextEditor: undefined as any,
  createStatusBarItem,
  createOutputChannel,
  showInformationMessage: async (..._args: any[]) => undefined,
  showWarningMessage: async (..._args: any[]) => undefined,
  showErrorMessage: async (..._args: any[]) => undefined,
  showQuickPick: async (..._args: any[]) => undefined,
  showInputBox: async (..._args: any[]) => undefined,
  setStatusBarMessage: (..._args: any[]): Disposable => new Disposable(),
  registerTreeDataProvider: (..._args: any[]): Disposable => new Disposable(),
  onDidChangeWindowState: (_listener: Listener): Disposable => new Disposable(),
};

export const commands = {
  executeCommand: async (..._args: any[]) => undefined,
  registerCommand: (..._args: any[]): Disposable => new Disposable(),
};

export const extensions = {
  getExtension: (_id: string) => undefined,
};

export const languages = {
  registerDocumentLinkProvider: (..._args: any[]): Disposable => new Disposable(),
};

export const env = {
  clipboard: {
    writeText: async (_value: string) => undefined,
    readText: async () => '',
  },
};
