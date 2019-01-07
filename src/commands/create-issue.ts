import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { ICreateIssueEpicList, IField, IFieldSchema, IIssue, ILabel } from '../http/api.model';
import { getConfigurationByKey } from '../shared/configuration';
import { IPickValue } from '../shared/configuration.model';
import { ASSIGNEES_MAX_RESULTS, CONFIG, SEARCH_MAX_RESULTS } from '../shared/constants';
import { jiraPluginDebugLog, printErrorMessageInOutput, printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import { selectIssueType } from '../shared/select-utilities';
import state, { verifyCurrentProject } from '../state/state';
import { NEW_ISSUE_FIELDS, NEW_ISSUE_STATUS } from './create-issue.model';
import { OpenIssueCommand } from './open-issue';
import { Command } from './shared/command';

// instances for keep data
let newIssueIstance = {};
let preloadedListValues = {};
let fieldsRequest = {};

export class CreateIssueCommand implements Command {
  public id = 'jira-plugin.createIssueCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
    if (verifyCurrentProject(project)) {
      try {
        newIssueIstance = {};
        preloadedListValues = {};
        fieldsRequest = {};
        // first of first we decide the type of the ticket
        const availableTypes = await state.jira.getAllIssueTypesWithFields(project);
        if (!!availableTypes) {
          const issueTypeSelected = await selectIssueType(false, availableTypes);
          if (!!issueTypeSelected) {
            newIssueIstance = { ...newIssueIstance, project };
            (<any>fieldsRequest) = {
              issuetype: {
                id: issueTypeSelected.id
              },
              project: {
                key: project
              }
            };
            let loopStatus = NEW_ISSUE_STATUS.CONTINUE;
            let executeRetriveValues = true;
            while (loopStatus === NEW_ISSUE_STATUS.CONTINUE) {
              const newIssuePicks = [];
              for (const fieldName in issueTypeSelected.fields) {
                // type and project forced to selected type and selected project
                if (fieldName !== 'issuetype' && fieldName !== 'project') {
                  const field = issueTypeSelected.fields[fieldName];
                  // load values for every field if necessary
                  if (executeRetriveValues) {
                    await retriveValues(project, field, fieldName, newIssuePicks);
                  }
                  if (!field.hideField) {
                    newIssuePicks.push({
                      field: fieldName,
                      label: `${issueTypeSelected.fields[fieldName].required ? '$(star) ' : ''}${field.name}`,
                      description: !!(<any>newIssueIstance)[fieldName]
                        ? (<any>newIssueIstance)[fieldName].toString()
                        : `Insert ${field.name}`,
                      pickValue: field,
                      fieldSchema: field.schema
                    });
                  }
                }
              }
              executeRetriveValues = false;
              // add last 3 custom items in the list
              newIssuePicks.push(
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
              );
              // second selector with all the fields
              const fieldToModifySelection = await vscode.window.showQuickPick(newIssuePicks, {
                placeHolder: `Insert Jira issue`,
                matchOnDescription: true
              });
              // manage the selected field from selector
              if (!!fieldToModifySelection && fieldToModifySelection.field !== NEW_ISSUE_FIELDS.DIVIDER.field) {
                switch (fieldToModifySelection.field) {
                  case NEW_ISSUE_FIELDS.INSERT_ISSUE.field:
                    loopStatus = mandatoryFieldsOk(issueTypeSelected.fields) ? NEW_ISSUE_STATUS.INSERT : loopStatus;
                    break;
                  case NEW_ISSUE_FIELDS.EXIT.field:
                    loopStatus = NEW_ISSUE_STATUS.STOP;
                    break;
                  default:
                    await manageSelectedField(fieldToModifySelection);
                }
              }
            }
            // insert
            if (loopStatus === NEW_ISSUE_STATUS.INSERT) {
              await insertNewTicket();
            } else {
              console.log(`Exit`);
            }
          }
        }
      } catch (err) {
        printErrorMessageInOutputAndShowAlert(err);
      }
    }
  }
}

const isCanPickMany = (fieldSchema: IFieldSchema) => {
  return fieldSchema.type.toString().toLowerCase() === 'array';
};

const isAssigneeOrReporterField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'assignee' || fieldName.toLowerCase() === 'reporter';
};

const isEpicLinkFieldSchema = (fieldSchema: IFieldSchema) => {
  return !!fieldSchema.custom && fieldSchema.custom.toLowerCase() === 'com.pyxis.greenhopper.jira:gh-epic-link';
};

const isLabelsField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'labels';
};

const isIssuelinksField = (fieldName: string) => {
  //   "update":{
  //     "issuelinks":[
  //        {
  //           "add":{
  //              "type":{
  //                 "name":"Blocks",
  //                 "inward":"is blocked by",
  //                 "outward":"blocks"
  //              },
  //              "outwardIssue":{
  //                 "key":"TEST-1"
  //              }
  //           }
  //        }
  //     ]
  //  }
  return fieldName.toLowerCase() === 'issuelinks';
};

const addDefaultIssueLinkTypesIfNessesary = (newIssuePicks: any[]) => {
  if ((<any>preloadedListValues)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field]) {
    newIssuePicks.push({
      field: NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field,
      label: NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.label,
      description: (<any>preloadedListValues)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field][0].inward,
      pickValue: (<any>preloadedListValues)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field][0]
    });
  }
};

const manageSpecialFields = async (project: string, field: IField, fieldName: string, newIssuePicks: any) => {
  if (isAssigneeOrReporterField(fieldName)) {
    // assignee autoCompleteUrl don't work, I use custom one
    (<any>preloadedListValues)[fieldName.toString()] = await state.jira.getAssignees({ project, maxResults: ASSIGNEES_MAX_RESULTS });
  }
  if (isEpicLinkFieldSchema(field.schema)) {
    const response = await state.jira.getCreateIssueEpics(
      getConfigurationByKey(CONFIG.BASE_URL) || '',
      getConfigurationByKey(CONFIG.WORKING_PROJECT) || '',
      SEARCH_MAX_RESULTS
    );
    // format issues in standard way
    if (!!response && !!response.epicLists) {
      const list: IIssue[] = [];
      (response.epicLists || []).forEach((epicList: ICreateIssueEpicList) => {
        epicList.epicNames.forEach(epic => {
          list.push({
            key: epic.key,
            description: epic.name,
            id: '',
            fields: {
              summary: '',
              status: {
                name: ''
              }
            }
          });
        });
      });
      (<any>preloadedListValues)[fieldName.toString()] = list || [];
    }
  }
  if (isLabelsField(fieldName)) {
    const response = await state.jira.customApiCall(field.autoCompleteUrl);
    (<any>preloadedListValues)[fieldName.toString()] = (response.suggestions || []).map((entrie: ILabel) => {
      entrie.key = entrie.label;
      entrie.description = '';
      return entrie;
    });
  }
  if (isIssuelinksField(fieldName)) {
    const response = await state.jira.customApiCall(field.autoCompleteUrl);
    for (const [key, value] of Object.entries(response)) {
      if (value instanceof Array) {
        if (!!value[0] && !!value[0].issues && value[0].issues instanceof Array) {
          (<any>preloadedListValues)[fieldName.toString()] = value[0].issues;
        }
      }
    }
    if (!!(<any>preloadedListValues)[fieldName.toString()]) {
      // issueLinkedType field
      const types = await state.jira.getAvailableLinkIssuesType();
      (<any>preloadedListValues)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field] = types.issueLinkTypes || [];
      addDefaultIssueLinkTypesIfNessesary(newIssuePicks);
    }
  }
};

const retriveValues = async (project: string, field: IField, fieldName: string, newIssuePicks: any): Promise<void> => {
  if (field.schema.type !== 'string' && field.schema.type !== 'number') {
    if (
      (!!field.schema.custom || field.schema.type === 'date' || field.schema.type === 'timetracking') &&
      !isEpicLinkFieldSchema(field.schema)
    ) {
      // need to manage this types
      jiraPluginDebugLog(`field`, JSON.stringify(field));
      field.hideField = true;
    } else {
      const wait = await manageSpecialFields(project, field, fieldName, newIssuePicks);
      if (!(<any>preloadedListValues)[fieldName.toString()] && !!field.autoCompleteUrl) {
        try {
          // use autoCompleteUrl for retrive list values
          const response = await state.jira.customApiCall(field.autoCompleteUrl);
          for (const [key, value] of Object.entries(response)) {
            // I assume this are the values because it's an array
            if (value instanceof Array) {
              (<any>preloadedListValues)[fieldName.toString()] = value;
            }
          }
        } catch (e) {
          (<any>preloadedListValues)[fieldName.toString()] = [];
        }
      }
      if (!(<any>preloadedListValues)[fieldName.toString()] && !!field.allowedValues) {
        (<any>preloadedListValues)[fieldName.toString()] = field.allowedValues;
      }
      // hide field if there aren't values
      if (!(<any>preloadedListValues)[fieldName.toString()] || (<any>preloadedListValues)[fieldName.toString()].length === 0) {
        field.hideField = true;
      }
    }
  }
};

const mandatoryFieldsOk = (fields: any): boolean => {
  for (const key in fields) {
    if (!!fields[key].required && !(<any>fieldsRequest)[key]) {
      printErrorMessageInOutput(`${key} field missing : ${JSON.stringify(fields[key])}`);
      return false;
    }
  }
  return true;
};

const generatePicks = (values: any[]) => {
  return values
    .map(value => {
      return {
        pickValue: value,
        label: value.name || value.value || value.key,
        description: value.description || value.summary
      };
    })
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
};

const manageSelectedField = async (fieldToModifySelection: any): Promise<void> => {
  switch (fieldToModifySelection.fieldSchema.type) {
    case 'string':
      {
        const text = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: `Insert ${fieldToModifySelection.pickValue.name}`,
          value:
            fieldToModifySelection.description !== `Insert ${fieldToModifySelection.pickValue.name}`
              ? fieldToModifySelection.description
              : undefined
        });
        (<any>newIssueIstance)[fieldToModifySelection.field] = text;
        (<any>fieldsRequest)[fieldToModifySelection.field] = text;
      }
      break;
    case 'number':
      {
        const text = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: `Insert ${fieldToModifySelection.pickValue.name}`,
          value:
            fieldToModifySelection.description !== `Insert ${fieldToModifySelection.pickValue.name}`
              ? fieldToModifySelection.description
              : undefined
        });
        if (!!text) {
          (<any>newIssueIstance)[fieldToModifySelection.field] = parseInt(text);
          (<any>fieldsRequest)[fieldToModifySelection.field] = parseInt(text);
        }
      }
      break;
    default: {
      if (
        !!(<any>preloadedListValues)[fieldToModifySelection.field] &&
        (<any>preloadedListValues)[fieldToModifySelection.field].length > 0
      ) {
        const canPickMany = isCanPickMany(fieldToModifySelection.fieldSchema);
        const selected = await vscode.window.showQuickPick<any>(generatePicks((<any>preloadedListValues)[fieldToModifySelection.field]), {
          placeHolder: `Insert value`,
          matchOnDescription: true,
          canPickMany
        });
        (<any>newIssueIstance)[fieldToModifySelection.field] = undefined;
        delete (<any>fieldsRequest)[fieldToModifySelection.field];
        if (!canPickMany ? !!selected : selected.length > 0) {
          const newValueSelected: IPickValue[] = !canPickMany ? [selected] : [...selected];
          (<any>newIssueIstance)[fieldToModifySelection.field] = newValueSelected.map((value: any) => value.label).join(' ');
          // assignee want a name prop and NOT id or key
          if (isAssigneeOrReporterField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.name);
            (<any>fieldsRequest)[fieldToModifySelection.field] = { name: !canPickMany ? values[0] : values };
          }
          // straight string or string[]
          if (
            isEpicLinkFieldSchema(fieldToModifySelection.fieldSchema) ||
            isLabelsField(fieldToModifySelection.field) ||
            isIssuelinksField(fieldToModifySelection.field)
          ) {
            const values = newValueSelected.map((value: any) => value.pickValue.key);
            (<any>fieldsRequest)[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }
          if (!(<any>fieldsRequest)[fieldToModifySelection.field]) {
            if (!!newValueSelected[0].pickValue.id) {
              const values = newValueSelected.map((value: any) => value.pickValue.id);
              (<any>fieldsRequest)[fieldToModifySelection.field] = {
                id: !canPickMany ? values[0] : values
              };
            } else {
              if (!!newValueSelected[0].pickValue.key) {
                const values = newValueSelected.map((value: any) => value.pickValue.key);
                (<any>fieldsRequest)[fieldToModifySelection.field] = {
                  key: !canPickMany ? values[0] : values
                };
              }
            }
          }
        }
      } else {
        vscode.window.showErrorMessage(`Debug msg - type not managed ${fieldToModifySelection.fieldSchema.type}`);
      }
    }
  }
};

const insertNewTicket = async (): Promise<void> => {
  const createdIssue = await state.jira.createIssue({ fields: { ...(<any>fieldsRequest) } });
  if (!!createdIssue && !!createdIssue.key) {
    // if the response is ok, we will open the created issue
    const action = await vscode.window.showInformationMessage('Issue created', 'Open in browser');
    if (action === 'Open in browser') {
      new OpenIssueCommand().run(createdIssue.key);
    }
  }
};
