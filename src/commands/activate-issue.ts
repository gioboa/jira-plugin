import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';
import state, { ActiveIssue, getActiveIssue, setActiveIssue } from '../state';

export class ActivateIssueCommand implements Command {

  public id = 'vscode-jira.activateIssues';

  @bind
  public async run(preselected: Issue | null): Promise<void> {
    const issue = await this.selectIssue(preselected);
    if (issue !== undefined) {
      setActiveIssue(issue);
    }
  }

  private async selectIssue(preselected: Issue | null): Promise<Issue | null | undefined> {
    if (preselected || preselected === null) {
      return preselected;
    }
    const activateIssue = getActiveIssue();
    const name = activateIssue ? `Deactivate ${activateIssue.key}` : undefined;
    return await vscode.commands.executeCommand<Issue | undefined | null>('vscode-jira.listMyIssues', name);
  }

}
