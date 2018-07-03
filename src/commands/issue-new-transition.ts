import { bind } from 'decko';
import * as vscode from 'vscode';
import { Transition } from '../api.model';
import { Command } from '../command';
import state, { canExecuteJiraAPI } from '../state';
import { selectIssue } from '../utils';

export class IssueNewTransitionCommand implements Command {
  public id = 'jira-plugin.issueNewTransition';

  @bind
  public async run(): Promise<void> {
    if (canExecuteJiraAPI()) {
      const issueKey = await selectIssue();
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
