import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { printErrorMessageInOutput } from '../state/state';
import { INewIssue, NEW_ISSUE_FIELDS, NEW_ISSUE_STATUS } from './create-issue.model';
import { Command } from './shared/command';

export class CreateIssueCommand implements Command {
  public id = 'jira-plugin.createIssueCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    try {
      let status = NEW_ISSUE_STATUS.CONTINUE;
      const newIssue: INewIssue = {
        summary: undefined,
        description: undefined
      };
      while (status === NEW_ISSUE_STATUS.CONTINUE) {
        const picks = [
          {
            pickValue: { field: NEW_ISSUE_FIELDS.SUMMARY.field, newIssue },
            label: NEW_ISSUE_FIELDS.SUMMARY.label,
            description: newIssue.summary || NEW_ISSUE_FIELDS.SUMMARY.description
          },
          {
            pickValue: { field: NEW_ISSUE_FIELDS.DESCRIPTION.field, newIssue },
            label: NEW_ISSUE_FIELDS.DESCRIPTION.label,
            description: newIssue.description || NEW_ISSUE_FIELDS.DESCRIPTION.description
          },
          {
            pickValue: { field: NEW_ISSUE_FIELDS.DIVIDER.field, newIssue },
            label: NEW_ISSUE_FIELDS.DIVIDER.label,
            description: NEW_ISSUE_FIELDS.DIVIDER.description
          },
          {
            pickValue: { field: NEW_ISSUE_FIELDS.INSERT_ISSUE.field, newIssue },
            label: NEW_ISSUE_FIELDS.INSERT_ISSUE.label,
            description: NEW_ISSUE_FIELDS.INSERT_ISSUE.description
          },
          {
            pickValue: { field: NEW_ISSUE_FIELDS.EXIT.field, newIssue },
            label: NEW_ISSUE_FIELDS.EXIT.label,
            description: NEW_ISSUE_FIELDS.EXIT.description
          }
        ];
        const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Insert Jira issue`, matchOnDescription: true });
        if (!!selected && selected.pickValue.field !== NEW_ISSUE_FIELDS.DIVIDER.field) {
          if (
            selected.pickValue.field !== NEW_ISSUE_FIELDS.INSERT_ISSUE.field &&
            selected.pickValue.field !== NEW_ISSUE_FIELDS.EXIT.field
          ) {
            let desc = await vscode.window.showInputBox({
              ignoreFocusOut: true,
              placeHolder: ''
            });
            (<any>newIssue)[selected.pickValue.field] = desc;
          } else {
            status = selected.pickValue.field === NEW_ISSUE_FIELDS.INSERT_ISSUE.field ? NEW_ISSUE_STATUS.INSERT : NEW_ISSUE_STATUS.STOP;
          }
        }
      }
      if (status === NEW_ISSUE_STATUS.INSERT) {
        console.log('Insert: ', JSON.stringify(newIssue));
      } else {
        console.log(`Exit`);
      }
    } catch (err) {
      printErrorMessageInOutput(err);
    }
  }
}
