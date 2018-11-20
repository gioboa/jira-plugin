import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { IAssignee, ICreateIssue, IIssueType, IPriority } from '../http/api.model';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG, MAX_RESULTS } from '../shared/constants';
import { selectAssignee, selectIssueType } from '../shared/select-utilities';
import state, { printErrorMessageInOutput, verifyCurrentProject } from '../state/state';
import { INewIssue, NEW_ISSUE_FIELDS, NEW_ISSUE_STATUS } from './create-issue.model';
import { OpenIssueCommand } from './open-issue';
import { Command } from './shared/command';

export class CreateIssueCommand implements Command {
  public id = 'jira-plugin.createIssueCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
    if (verifyCurrentProject(project)) {
      try {
        // load once the options
        const assignees = await state.jira.getAssignees({ project, maxResults: MAX_RESULTS });
        const priorities = await state.jira.getAllPriorities();
        const types = await state.jira.getAllIssueTypes();

        // instance for keep data
        const newIssue: INewIssue = {
          type: undefined,
          summary: undefined,
          description: undefined,
          assignee: undefined,
          priority: undefined
        };
        let status = NEW_ISSUE_STATUS.CONTINUE;
        while (status === NEW_ISSUE_STATUS.CONTINUE) {
          // genearte/update new issue selector
          const createIssuePicks = generateNewIssuePicks(newIssue, priorities && priorities.length > 0);
          const selected = await vscode.window.showQuickPick(createIssuePicks, {
            placeHolder: `Insert Jira issue`,
            matchOnDescription: true
          });

          // manage the selected field
          if (!!selected && selected.field !== NEW_ISSUE_FIELDS.DIVIDER.field) {
            if (selected.field !== NEW_ISSUE_FIELDS.INSERT_ISSUE.field && selected.field !== NEW_ISSUE_FIELDS.EXIT.field) {
              await manageSelectedField(selected, newIssue, types, assignees, priorities);
            } else {
              status =
                selected.field === NEW_ISSUE_FIELDS.EXIT.field
                  ? NEW_ISSUE_STATUS.STOP
                  : mandatoryFieldsOk(newIssue)
                  ? NEW_ISSUE_STATUS.INSERT
                  : status;
            }
          }
        }
        // insert
        if (status === NEW_ISSUE_STATUS.INSERT) {
          await insertNewTicket(newIssue);
        } else {
          // console.log(`Exit`);
        }
      } catch (err) {
        printErrorMessageInOutput(err);
      }
    }
  }
}

const generateNewIssuePicks = (newIssue: INewIssue, addPriority: boolean) => {
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

  if (addPriority) {
    picks.splice(4, 0, {
      field: NEW_ISSUE_FIELDS.PRIORITY.field,
      label: NEW_ISSUE_FIELDS.PRIORITY.label,
      description: !!newIssue.priority ? newIssue.priority.name : NEW_ISSUE_FIELDS.PRIORITY.description
    });
  }
  return picks;
};

const mandatoryFieldsOk = (newIssue: INewIssue) => {
  return !!newIssue.summary && !!newIssue.description && !!newIssue.type;
};

const insertNewTicket = async (newIssue: INewIssue) => {
  const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
  if (mandatoryFieldsOk(newIssue)) {
    let request = {
      fields: {
        project: {
          key: project
        },
        summary: newIssue.summary,
        description: newIssue.description,
        issuetype: {
          id: (<IIssueType>newIssue.type).id
        }
      }
    } as ICreateIssue;
    // adding assignee
    if (!!newIssue.assignee) {
      request.fields = {
        ...request.fields,
        assignee: {
          name: (<IAssignee>newIssue.assignee).name
        }
      };
    }
    // adding priority
    if (!!newIssue.priority) {
      request.fields = {
        ...request.fields,
        priority: {
          id: newIssue.priority.id
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
};

const manageSelectedField = async (
  selected: any,
  newIssue: INewIssue,
  types: IIssueType[],
  assignees: IAssignee[],
  priorities: IPriority[]
) => {
  switch (selected.field) {
    case NEW_ISSUE_FIELDS.SUMMARY.field:
    case NEW_ISSUE_FIELDS.DESCRIPTION.field:
      (<any>newIssue)[selected.field] = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: ''
      });
      break;
    case NEW_ISSUE_FIELDS.TYPE.field:
      newIssue.type = await selectIssueType(true, types);
      break;
    case NEW_ISSUE_FIELDS.ASSIGNEE.field:
      newIssue.assignee = await selectAssignee(false, false, false, assignees);
      break;
    case NEW_ISSUE_FIELDS.PRIORITY.field:
      {
        const priorityPicks = (priorities || []).map((priority: IPriority) => {
          return {
            pickValue: priority,
            label: priority.id,
            description: priority.name
          };
        });
        const selected = await vscode.window.showQuickPick(priorityPicks, {
          matchOnDescription: true,
          matchOnDetail: true,
          placeHolder: 'Select an issue'
        });
        newIssue.priority = selected ? selected.pickValue : undefined;
      }
      break;
  }
};
