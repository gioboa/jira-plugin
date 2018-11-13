import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { IAssignee, ICreateIssue } from '../http/api.model';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { selectAssignee, selectIssueType } from '../shared/select-utilities';
import state, { printErrorMessageInOutput } from '../state/state';
import { INewIssue, NEW_ISSUE_FIELDS, NEW_ISSUE_STATUS } from './create-issue.model';
import { OpenIssueCommand } from './open-issue';
import { Command } from './shared/command';

export class CreateIssueCommand implements Command {
  public id = 'jira-plugin.createIssueCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    try {
      let status = NEW_ISSUE_STATUS.CONTINUE;
      const newIssue: INewIssue = {
        type: undefined,
        summary: undefined,
        description: undefined,
        assignee: undefined
      };
      while (status === NEW_ISSUE_STATUS.CONTINUE) {
        const picks = [
          {
            field: NEW_ISSUE_FIELDS.TYPE.field,
            label: NEW_ISSUE_FIELDS.TYPE.label,
            description: !!newIssue.type ? newIssue.type.name : NEW_ISSUE_FIELDS.TYPE.description
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
            field: NEW_ISSUE_FIELDS.ASSIGNEE.field,
            label: NEW_ISSUE_FIELDS.ASSIGNEE.label,
            description: !!newIssue.assignee ? (<IAssignee>newIssue.assignee).name : NEW_ISSUE_FIELDS.ASSIGNEE.description
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
              case NEW_ISSUE_FIELDS.ASSIGNEE.field:
                newIssue.assignee = await selectAssignee(false, false, false);
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
          let request = {
            fields: {
              project: {
                key: project
              },
              summary: newIssue.summary,
              description: newIssue.description,
              issuetype: {
                id: newIssue.type.id
              }
            }
          } as ICreateIssue;
          // adding assignee
          if (!!newIssue.assignee) {
            request.fields = {
              ...request.fields,
              assignee: {
                key: (<IAssignee>newIssue.assignee).key
              }
            };
          }
          const createdIssue = await state.jira.createIssue(request);
          if (!!createdIssue && !!createdIssue.key) {
            // if the response is ok, we will open the created issue
            const action = await vscode.window.showInformationMessage('Issue created', 'Open in browser');
            if (action === 'Open in browser') {
              new OpenIssueCommand().run(createdIssue.key);
            }
          }
        }
      } else {
        console.log(`Exit`);
      }
    } catch (err) {
      printErrorMessageInOutput(err);
    }
  }
}
