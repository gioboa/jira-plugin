import * as vscode from 'vscode';
import state from '../state/state';
import { getConfigurationByKey } from './configuration';
import { CONFIG } from './constants';

export class StatusBarManager {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  }

  public async updateStatusBar(project: string): Promise<void> {
    if (!state.jira) {
      return;
    }
    if (!project) {
      project = (await getConfigurationByKey(CONFIG.WORKING_PROJECT)) || '';
    }
    if (!!project) {
      this.item.text = `Jira-plugin: working project -> ${project}`;
    } else {
      this.item.text = `Jira-plugin: NO working project`;
    }
    this.item.show();
  }

  public dispose(): void {
    this.item.dispose();
  }
}
