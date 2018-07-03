import * as vscode from 'vscode';
import { CONFIG, getConfigurationByKey } from './configuration';
import state from './state';

export class StatusBarManager {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    setTimeout(() => this.updateStatusBar(''), 2000);
  }

  public async updateStatusBar(currentProject: string): Promise<void> {
    if (!state.jira) {
      return;
    }
    if (!currentProject) {
      currentProject = (await getConfigurationByKey(CONFIG.CURRENT_PROJECT)) || '';
    }
    if (!!currentProject) {
      this.item.text = `JIRA current project -> ${currentProject}`;
    } else {
      this.item.text = `JIRA no project selected`;
    }
    this.item.show();
  }

  public dispose(): void {
    this.item.dispose();
  }
}
