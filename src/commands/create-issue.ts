import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { ICreateIssueEpicList, IField, IFieldSchema, IIssue, ILabel } from '../http/api.model';
import { configuration, logger, selectValues } from '../services';
import { IPickValue } from '../services/configuration.model';
import { CONFIG, SEARCH_MAX_RESULTS } from '../shared/constants';
import state, { verifyCurrentProject } from '../store/state';
import openIssueCommand from './open-issue';

// this object store all user choices
let newIssueIstance = {};
// this object store all available values for each field
let preloadedListValues = {};
// this object store the selected values and is the payload for createIssue API
let fieldsRequest = {};

export default async function createIssueCommand(issueItem: IssueItem): Promise<void> {
  const project = configuration.get(CONFIG.WORKING_PROJECT);
  if (verifyCurrentProject(project)) {
    try {
      newIssueIstance = {};
      preloadedListValues = {};
      fieldsRequest = {};
      // first of first we decide the type of the ticket
      const availableTypes = await state.jira.getAllIssueTypesWithFields(project);
      if (!!availableTypes) {
        // here the user select which type of issue create
        const issueTypeSelected = await selectValues.selectIssueType(false, availableTypes);
        if (!!issueTypeSelected) {
          // store project
          newIssueIstance = { ...newIssueIstance, project };
          // store issueType and project in payload
          // user cannot modify the values
          (<any>fieldsRequest) = {
            issuetype: {
              id: issueTypeSelected.id
            },
            project: {
              key: project
            }
          };
          let loopStatus = NEW_ISSUE_STATUS.CONTINUE;
          // this variable is used for retrieve only one time the available values inside the loop
          let executeretrieveValues = true;
          while (loopStatus === NEW_ISSUE_STATUS.CONTINUE) {
            // all selector available items
            const newIssuePicks = [];
            for (const fieldName in issueTypeSelected.fields) {
              // type and project forced before in the payload
              if (fieldName !== 'issuetype' && fieldName !== 'project') {
                const field = issueTypeSelected.fields[fieldName];
                // load values for every field if necessary
                if (executeretrieveValues) {
                  await retrieveValues(project, field, fieldName);
                }
                // if there is issuelinks field we need also of issuelinksType
                // so we add the field in selector available items
                if (fieldName === NEW_ISSUE_FIELDS.ISSUE_LINKS.field) {
                  addDefaultIssueLinkTypesIfNessesary(newIssuePicks);
                }
                if (!field.hideField) {
                  // create the item, use preselected value or default label 'Insert + fieldName'
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
            executeretrieveValues = false;
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
                  // check if the mandatory field are populated, if not, we go on
                  loopStatus = mandatoryFieldsOk(issueTypeSelected.fields) ? NEW_ISSUE_STATUS.INSERT : loopStatus;
                  break;
                case NEW_ISSUE_FIELDS.EXIT.field:
                  loopStatus = NEW_ISSUE_STATUS.STOP;
                  break;
                default:
                  // with the field selected values populate the palyload
                  await manageSelectedField(fieldToModifySelection);
              }
            }
          }
          if (loopStatus === NEW_ISSUE_STATUS.INSERT) {
            // Jira create issue API
            await insertNewTicket();
          } else {
            // Exit
          }
        }
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
  }
}

// statuses for new issue loop
const NEW_ISSUE_STATUS = {
  STOP: -1,
  CONTINUE: 0,
  INSERT: 1
};

// items available inside the selector
const NEW_ISSUE_FIELDS = {
  ISSUE_LINKS: {
    field: 'issuelinks',
    label: 'Linked issues',
    description: ''
  },
  ISSUE_LINKS_TYPES: {
    field: 'issuelinksTypes',
    label: 'Linked issues type',
    description: ''
  },
  DIVIDER: {
    field: 'divider',
    label: '--- $(star) required ---',
    description: ''
  },
  INSERT_ISSUE: {
    field: 'insert_issue',
    label: 'Insert issue',
    description: ''
  },
  EXIT: {
    field: 'exit',
    label: 'Exit',
    description: ''
  }
};

// define if the selector can have multiple choices
const isCanPickMany = (field: any) => {
  return field.fieldSchema.type.toString().toLowerCase() === 'array' && !isIssuelinksField(field.field);
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

const isIssuelinksTypeField = (fieldName: string) => {
  return fieldName === NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field;
};

const isIssuelinksField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'issuelinks';
};

// if there is issuelinks field we need also of issuelinksType
// so we add the field in selector available items
const addDefaultIssueLinkTypesIfNessesary = (newIssuePicks: any[]) => {
  const field = NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field;
  if ((<any>preloadedListValues)[field]) {
    // use previous selection or force the first type
    newIssuePicks.push({
      field,
      label: NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.label,
      description: (<any>fieldsRequest)[field] || (<any>preloadedListValues)[field][0].inward,
      fieldSchema: {
        type: 'custom'
      }
    });
    (<any>fieldsRequest)[field] = (<any>fieldsRequest)[field] || (<any>preloadedListValues)[field][0].inward;
  }
};

// custom behavior for some custom/particular fields
const manageSpecialFields = async (project: string, field: IField, fieldName: string) => {
  if (isAssigneeOrReporterField(fieldName)) {
    // assignee autoCompleteUrl don't work, I use custom one
    (<any>preloadedListValues)[fieldName.toString()] = await state.jira.getAssignees(project);
  }
  if (isEpicLinkFieldSchema(field.schema)) {
    const response = await state.jira.getCreateIssueEpics(configuration.get(CONFIG.WORKING_PROJECT), SEARCH_MAX_RESULTS);
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
              },
              project: {
                id: '',
                key: '',
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
    }
  }
};

const retrieveValues = async (project: string, field: IField, fieldName: string): Promise<void> => {
  if (field.schema.type !== 'string' && field.schema.type !== 'number') {
    // those types are not managed
    if (
      (!!field.schema.custom || field.schema.type === 'date' || field.schema.type === 'timetracking') &&
      !isEpicLinkFieldSchema(field.schema)
    ) {
      // output log useful for remote debug
      logger.jiraPluginDebugLog(`field`, JSON.stringify(field));
      field.hideField = true;
    } else {
      // first of first special fields
      const wait = await manageSpecialFields(project, field, fieldName);
      // if the field has autoComplete Url property we use that for retrieve available values
      if (!(<any>preloadedListValues)[fieldName.toString()] && !!field.autoCompleteUrl) {
        try {
          // here the Jira API call
          const response = await state.jira.customApiCall(field.autoCompleteUrl);
          for (const [key, value] of Object.entries(response)) {
            // I assume those are the values because it's an array
            if (value instanceof Array) {
              (<any>preloadedListValues)[fieldName.toString()] = value;
            }
          }
        } catch (e) {
          (<any>preloadedListValues)[fieldName.toString()] = [];
        }
      }
      // if the field has allowedValues we use that for get all the values
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
      // output log useful for remote debug
      logger.printErrorMessageInOutput(`${key} field missing : ${JSON.stringify(fields[key])}`);
      return false;
    }
  }
  return true;
};

// from the preloaded values we generate selector items
const generatePicks = (values: any[]) => {
  return values
    .map(value => {
      return {
        pickValue: value,
        label: value.inward || value.name || value.value || value.key, // do not change order
        description: value.description || value.summary || ''
      };
    })
    .sort((a, b) => (a.label < b.label ? -1 : a.label > b.label ? 1 : 0));
};

// after selection we fill the payload and the user choices
const manageSelectedField = async (fieldToModifySelection: any): Promise<void> => {
  switch (fieldToModifySelection.fieldSchema.type) {
    case 'string':
      {
        // simple input
        const text = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: `Insert ${fieldToModifySelection.pickValue.name}`,
          value:
            fieldToModifySelection.description !== `Insert ${fieldToModifySelection.pickValue.name}`
              ? fieldToModifySelection.description
              : undefined
        });
        // update user choices
        (<any>newIssueIstance)[fieldToModifySelection.field] = text;
        // update payload
        (<any>fieldsRequest)[fieldToModifySelection.field] = text;
      }
      break;
    case 'number':
      {
        // simple input
        const text = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: `Insert ${fieldToModifySelection.pickValue.name}`,
          value:
            fieldToModifySelection.description !== `Insert ${fieldToModifySelection.pickValue.name}`
              ? fieldToModifySelection.description
              : undefined
        });
        if (!!text) {
          // update user choices
          (<any>newIssueIstance)[fieldToModifySelection.field] = parseInt(text);
          // update payload
          (<any>fieldsRequest)[fieldToModifySelection.field] = parseInt(text);
        }
      }
      break;
    default: {
      // if there are some preloaded values for the field
      if (
        !!(<any>preloadedListValues)[fieldToModifySelection.field] &&
        (<any>preloadedListValues)[fieldToModifySelection.field].length > 0
      ) {
        const canPickMany = isCanPickMany(fieldToModifySelection);
        const selected = await vscode.window.showQuickPick<any>(generatePicks((<any>preloadedListValues)[fieldToModifySelection.field]), {
          placeHolder: `Insert value`,
          matchOnDescription: true,
          canPickMany
        });
        // clear previous selection
        (<any>newIssueIstance)[fieldToModifySelection.field] = undefined;
        // clear previous payload
        delete (<any>fieldsRequest)[fieldToModifySelection.field];
        if (!canPickMany ? !!selected : selected.length > 0) {
          // update user choices
          const newValueSelected: IPickValue[] = !canPickMany ? [selected] : [...selected];
          (<any>newIssueIstance)[fieldToModifySelection.field] = newValueSelected.map((value: any) => value.label).join(' ');
          // assignee/reporter want a name prop and NOT id or key
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
          // save inward for issuelinksType
          if (isIssuelinksTypeField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.inward);
            (<any>fieldsRequest)[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }
          // update payload statndard way use id or key
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

// issuelinks what update property in the payload
const generateUpdateJson = (fieldsRequest: any): any => {
  // if user select some issuelinks
  if (fieldsRequest[NEW_ISSUE_FIELDS.ISSUE_LINKS.field]) {
    // find the whole type from user field selection
    const type = (<any>preloadedListValues)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field].find(
      (type: any) => type.inward === fieldsRequest[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field]
    );
    if (!type) {
      return undefined;
    }
    const issueLink = (<any>fieldsRequest)[NEW_ISSUE_FIELDS.ISSUE_LINKS.field];
    if (!issueLink) {
      return undefined;
    }
    let res: any = {
      issuelinks: []
    };
    // only one issueLinks https://jira.atlassian.com/browse/JRASERVER-66329
    res.issuelinks.push({
      add: {
        type: {
          name: type.name,
          inward: type.inward,
          outward: type.outward
        },
        outwardIssue: {
          key: issueLink
        }
      }
    });
    return res;
  }
  return undefined;
};

const insertNewTicket = async (): Promise<void> => {
  // create update json for issuelinks fields
  const update = generateUpdateJson(fieldsRequest);
  // clean fields payload
  delete (<any>fieldsRequest)[NEW_ISSUE_FIELDS.ISSUE_LINKS.field];
  delete (<any>fieldsRequest)[NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field];
  // create the final payload
  let payload;
  payload = { fields: { ...(<any>fieldsRequest) } };
  if (!!update) {
    payload = { ...payload, update: { ...update } };
  }
  const createdIssue = await state.jira.createIssue(payload);
  if (!!createdIssue && !!createdIssue.key) {
    // if the response is ok, we will open the created issue
    const action = await vscode.window.showInformationMessage('Issue created', 'Open in browser');
    if (action === 'Open in browser') {
      openIssueCommand(createdIssue.key);
    }
  }
};
