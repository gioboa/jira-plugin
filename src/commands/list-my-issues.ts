import { bind } from 'decko';
import * as vscode from 'vscode';
import { Issue } from '../api';
import { Command } from '../command';
import { CONFIG, getConfigurationByKey } from '../configuration';
import state from '../state';
import { selectStatus } from '../utils';

export class ListMyIssuesCommand implements Command<Issue | undefined | null> {
  public id = 'jira-plugin.listMyIssues';

  @bind
  public async run(): Promise<Issue | undefined | null> {
    const currentProject = getConfigurationByKey(CONFIG.CURRENT_PROJECT);
    const status = await selectStatus();
    if (!!status) {
      const issues = await state.jira.search({
        jql: `project in (${currentProject}) AND status = ${status} AND assignee in (currentUser()) ORDER BY updated DESC`
      });
      const picks = (issues.issues || []).map(issue => {
        return {
          issue,
          label: issue.key,
          description: issue.fields.summary,
          detail: issue.fields.description
        };
      });
      if (picks.length > 0) {
        const selected = await vscode.window.showQuickPick(picks, {
          matchOnDescription: true,
          matchOnDetail: true,
          placeHolder: 'Select an issue'
        });
        if (selected) {
          const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${selected.label}`;
          await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
        }
      } else {
        vscode.window.showInformationMessage(`No issues found: project - ${currentProject} | status - ${status}`);
      }
    }
    return undefined;
  }
}
