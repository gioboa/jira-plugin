// Vitest setup: provides what extension.ts activate() normally wires up
// (extension context with global state, output channel) on top of the seeded configuration.
import './seed';
import { configuration, store } from '../../src/services';
import { settings } from '../utils/settings';
import { window } from './vscode';

class MemoryMemento {
  private store = new Map<string, any>();
  keys(): readonly string[] {
    return [...this.store.keys()];
  }
  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.store.has(key) ? this.store.get(key) : defaultValue;
  }
  async update(key: string, value: any): Promise<void> {
    if (value === undefined) {
      this.store.delete(key);
    } else {
      this.store.set(key, value);
    }
  }
}

store.state.context = {
  globalState: new MemoryMemento(),
  workspaceState: new MemoryMemento(),
} as any;
store.state.channel = window.createOutputChannel('JIRA-PLUGIN') as any;
configuration.setPassword(settings.password);
