import { bind } from 'decko';
import * as vscode from 'vscode';
import { Transition } from '../http/api.model';
import { selectIssue } from '../shared/utilities';
import state, { canExecuteJiraAPI } from '../state/state';
import { Command } from './shared/command';
import { SEARCH_MODE } from '../shared/constants';

export class ChangeIssueStatusCommand implements Command {
  public id = 'jira-plugin.changeIssueStatusCommand';

  @bind
  public async run(): Promise<void> {
    if (canExecuteJiraAPI()) {
      const issueKey = await selectIssue(SEARCH_MODE.ID);
      if (issueKey) {
        const newTransition = await this.selectTransition(issueKey);
        if (newTransition) {
          const result = await state.jira.doTransition(issueKey, {
            transition: {
              id: newTransition.id
            }
          });
        }
      }
    }
  }

  private async selectTransition(issueKey: string): Promise<Transition | null | undefined> {
    const transitions = await state.jira.getTransitions(issueKey);
    const picks = transitions.transitions.map(transition => ({
      label: transition.name,
      description: '',
      transition
    }));
    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: `Select transition to execute for ${issueKey}`,
      matchOnDescription: true
    });
    return selected ? selected.transition : undefined;
  }
}
