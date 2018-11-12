import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import state, { printErrorMessageInOutput } from '../state/state';
import { INewIssue, NEW_ISSUE_FIELDS, NEW_ISSUE_STATUS } from './create-issue.model';
import { Command } from './shared/command';
import { selectIssueType } from '../shared/select-utilities';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { SSL_OP_NO_TICKET } from 'constants';

export class CreateIssueCommand implements Command {
  public id = 'jira-plugin.createIssueCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    try {
      let status = NEW_ISSUE_STATUS.CONTINUE;
      const newIssue: INewIssue = {
        type: undefined,
        summary: undefined,
        description: undefined
      };
      while (status === NEW_ISSUE_STATUS.CONTINUE) {
        const picks = [
          {
            field: NEW_ISSUE_FIELDS.TYPE.field,
            label: NEW_ISSUE_FIELDS.TYPE.label,
            description: newIssue.type || NEW_ISSUE_FIELDS.TYPE.description
          },
          {
            field: NEW_ISSUE_FIELDS.SUMMARY.field,
            label: NEW_ISSUE_FIELDS.SUMMARY.label,
            description: newIssue.summary || NEW_ISSUE_FIELDS.SUMMARY.description
          },
          {
            field: NEW_ISSUE_FIELDS.DESCRIPTION.field,
            label: NEW_ISSUE_FIELDS.DESCRIPTION.label,
            description: newIssue.description || NEW_ISSUE_FIELDS.DESCRIPTION.description
          },
          {
            field: NEW_ISSUE_FIELDS.DIVIDER.field,
            label: NEW_ISSUE_FIELDS.DIVIDER.label,
            description: NEW_ISSUE_FIELDS.DIVIDER.description
          },
          {
            field: NEW_ISSUE_FIELDS.INSERT_ISSUE.field,
            label: NEW_ISSUE_FIELDS.INSERT_ISSUE.label,
            description: NEW_ISSUE_FIELDS.INSERT_ISSUE.description
          },
          {
            field: NEW_ISSUE_FIELDS.EXIT.field,
            label: NEW_ISSUE_FIELDS.EXIT.label,
            description: NEW_ISSUE_FIELDS.EXIT.description
          }
        ];
        const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Insert Jira issue`, matchOnDescription: true });
        if (!!selected && selected.field !== NEW_ISSUE_FIELDS.DIVIDER.field) {
          if (selected.field !== NEW_ISSUE_FIELDS.INSERT_ISSUE.field && selected.field !== NEW_ISSUE_FIELDS.EXIT.field) {
            switch (selected.field) {
              case NEW_ISSUE_FIELDS.SUMMARY.field:
              case NEW_ISSUE_FIELDS.DESCRIPTION.field:
                (<any>newIssue)[selected.field] = await vscode.window.showInputBox({
                  ignoreFocusOut: true,
                  placeHolder: ''
                });
                break;
              case NEW_ISSUE_FIELDS.TYPE.field:
                newIssue.type = await selectIssueType(true);
                break;
            }
          } else {
            status = selected.field === NEW_ISSUE_FIELDS.INSERT_ISSUE.field ? NEW_ISSUE_STATUS.INSERT : NEW_ISSUE_STATUS.STOP;
          }
        }
      }
      if (status === NEW_ISSUE_STATUS.INSERT) {
        const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
        if (project && newIssue.summary && newIssue.description && newIssue.type) {
          const a = await state.jira.createIssue({
            fields: {
              project: {
                key: project
              },
              summary: newIssue.summary,
              description: newIssue.description,
              issuetype: {
                id: newIssue.type.split('-')[0].trim()
              }
            }
          });
        }
      } else {
        console.log(`Exit`);
      }
    } catch (err) {
      printErrorMessageInOutput(err);
    }
  }
}
