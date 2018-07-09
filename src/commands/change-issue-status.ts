import { bind } from 'decko';
import { SEARCH_MODE } from '../shared/constants';
import { selectIssue, selectTransition } from '../shared/select-utilities';
import state, { canExecuteJiraAPI } from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueStatusCommand implements Command {
  public id = 'jira-plugin.changeIssueStatusCommand';

  @bind
  public async run(): Promise<void> {
    if (canExecuteJiraAPI()) {
      const issueKey = await selectIssue(SEARCH_MODE.ID);
      if (issueKey) {
        const newTransitionId = await selectTransition(issueKey);
        if (newTransitionId) {
          const result = await state.jira.doTransition(issueKey, {
            transition: {
              id: newTransitionId
            }
          });
        }
      }
    }
  }
}
