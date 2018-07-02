import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue, Transition } from '../api';
import { Command } from '../command';
import { checkEnabled } from '../extension';
import state, { ActiveIssue, getActiveIssue } from '../state';

export class TransitionIssueCommand implements Command {

  public id = 'vscode-jira.transitionIssues';

  @bind
  public async run(withDeactivation = true): Promise<void> {
    if (!checkEnabled()) {
      return;
    }
    const activeIssue = getActiveIssue();
    if (activeIssue) {
      const selected = await this.selectTransition(withDeactivation, activeIssue);
      if (selected === null) {
        await vscode.commands.executeCommand('vscode-jira.activateIssues', null);
      } else  if (selected !== undefined) {
        await state.jira.doTransition(activeIssue.key, {
          transition: {
            id: selected.id
          }
        });
        await this.deactivateWhenDone(activeIssue);
      }
      state.update();
    }
  }

  private async selectTransition(withActivation: boolean, activeIssue: ActiveIssue):
      Promise<Transition | null | undefined> {
    const transitions = await state.jira.getTransitions(activeIssue.key);
    const picks = transitions.transitions.map(transition => ({
      label: 'Next:',
      description: transition.name,
      transition
    }));
    if (withActivation) {
      picks.unshift({
        label: 'Pause:',
        description: this.getDeactivationText(activeIssue),
        transition: null as any
      });
    }
    const selected = await vscode.window.showQuickPick(picks,
      {
        placeHolder: `Select transition to execute for ${activeIssue.key}`,
        matchOnDescription: true
      }
    );
    return selected ? selected.transition : undefined;
  }

  private getDeactivationText(activeIssue: ActiveIssue): string {
    return `Deactivate ${activeIssue.key}`;
  }

  private async deactivateWhenDone(activeIssue: ActiveIssue): Promise<void> {
    const result = await state.jira.search({jql: `issue = "${activeIssue.key}" AND resolution = Resolved`});
    if ((result.issues || []).length > 0) {
      vscode.commands.executeCommand('vscode-jira.activateIssues', null);
    }
  }

}
