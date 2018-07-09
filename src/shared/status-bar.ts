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

    this.item.tooltip = 'Click for set working project';
    this.item.command = 'jira-plugin.setWorkingProjectCommand';
    this.item.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);

    this.item.show();
  }

  public dispose(): void {
    this.item.dispose();
  }
}
