import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { configuration, createIssue, logger, selectValues } from '../services';
import { IPickValue } from '../services/configuration.model';
import { CONFIG } from '../shared/constants';
import state, { verifyCurrentProject } from '../store/state';

export default async function createIssueCommand(issueItem: IssueItem): Promise<void> {
  const project = configuration.get(CONFIG.WORKING_PROJECT);
  if (verifyCurrentProject(project)) {
    try {
      // first of first we decide the type of the ticket
      const availableTypes = await state.jira.getAllIssueTypesWithFields(project);
      if (!!availableTypes) {
        // here the user select which type of issue create
        createIssue.init(await selectValues.selectIssueType(false, availableTypes));
        if (!!createIssue.issueTypeSelected) {
          // store project
          createIssue.populateNewIssue({ project });
          // store issueType and project in payload
          // user cannot modify the values
          createIssue.populateRequest({
            issuetype: {
              id: createIssue.issueTypeSelected.id
            },
            project: {
              key: project
            }
          });
          let loopStatus = createIssue.NEW_ISSUE_STATUS.CONTINUE;
          // this variable is used for retrieve only one time the available values inside the loop
          let executeretrieveValues = true;
          while (loopStatus === createIssue.NEW_ISSUE_STATUS.CONTINUE) {
            // all selector available items
            const newIssuePicks = [];
            for (const fieldName in createIssue.issueTypeSelected.fields) {
              // type and project forced before in the payload
              if (fieldName !== 'issuetype' && fieldName !== 'project') {
                // load values for every field if necessary
                if (executeretrieveValues) {
                  await createIssue.retrieveValues(fieldName);
                }
                // if there is issuelinks field we need also of issuelinksType
                // so we add the field in selector available items
                if (fieldName === createIssue.NEW_ISSUE_FIELDS.ISSUE_LINKS.field) {
                  createIssue.addDefaultIssueLinkTypesIfNessesary(newIssuePicks);
                }
                const field = createIssue.getField(fieldName);
                if (!field.hideField) {
                  // create the item, use preselected value or default label 'Insert + fieldName'
                  newIssuePicks.push({
                    field: fieldName,
                    label: `${createIssue.issueTypeSelected.fields[fieldName].required ? '$(star) ' : ''}${field.name}`,
                    description: !!createIssue.newIssueIstance[fieldName]
                      ? createIssue.newIssueIstance[fieldName].toString()
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
                field: createIssue.NEW_ISSUE_FIELDS.DIVIDER.field,
                label: createIssue.NEW_ISSUE_FIELDS.DIVIDER.label,
                description: createIssue.NEW_ISSUE_FIELDS.DIVIDER.description
              },
              {
                field: createIssue.NEW_ISSUE_FIELDS.INSERT_ISSUE.field,
                label: createIssue.NEW_ISSUE_FIELDS.INSERT_ISSUE.label,
                description: createIssue.NEW_ISSUE_FIELDS.INSERT_ISSUE.description
              },
              {
                field: createIssue.NEW_ISSUE_FIELDS.EXIT.field,
                label: createIssue.NEW_ISSUE_FIELDS.EXIT.label,
                description: createIssue.NEW_ISSUE_FIELDS.EXIT.description
              }
            );
            // second selector with all the fields
            const fieldToModifySelection = await vscode.window.showQuickPick(newIssuePicks, {
              placeHolder: `Insert Jira issue`,
              matchOnDescription: true
            });
            // manage the selected field from selector
            if (!!fieldToModifySelection && fieldToModifySelection.field !== createIssue.NEW_ISSUE_FIELDS.DIVIDER.field) {
              switch (fieldToModifySelection.field) {
                case createIssue.NEW_ISSUE_FIELDS.INSERT_ISSUE.field:
                  // check if the mandatory field are populated, if not, we go on
                  loopStatus = createIssue.mandatoryFieldsOk ? createIssue.NEW_ISSUE_STATUS.INSERT : loopStatus;
                  break;
                case createIssue.NEW_ISSUE_FIELDS.EXIT.field:
                  loopStatus = createIssue.NEW_ISSUE_STATUS.STOP;
                  break;
                default:
                  // with the field selected values populate the palyload
                  await manageSelectedField(fieldToModifySelection);
              }
            }
          }
          if (loopStatus === createIssue.NEW_ISSUE_STATUS.INSERT) {
            // Jira create issue API
            await createIssue.insertNewTicket();
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

// from the preloaded values we generate selector items
const generatePicks = (values: any[]) => {
  return values
    .map(value => {
      return {
        pickValue: value,
        label: value.inward || value.name || value.value || value.key || value.label || Object.values(value)[0], // do not change order
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
        createIssue.newIssueIstance[fieldToModifySelection.field] = text;
        // update payload
        createIssue.requestJson[fieldToModifySelection.field] = text;
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
          createIssue.newIssueIstance[fieldToModifySelection.field] = parseInt(text);
          // update payload
          createIssue.requestJson[fieldToModifySelection.field] = parseInt(text);
        }
      }
      break;
    default: {
      // if there are some preloaded values for the field
      if (
        !!createIssue.preloadedListValues[fieldToModifySelection.field] &&
        createIssue.preloadedListValues[fieldToModifySelection.field].length > 0
      ) {
        const canPickMany = createIssue.isCanPickMany(fieldToModifySelection);
        const selected = await vscode.window.showQuickPick<any>(
          generatePicks(createIssue.preloadedListValues[fieldToModifySelection.field]),
          {
            placeHolder: `Insert value`,
            matchOnDescription: true,
            canPickMany
          }
        );
        // clear previous selection
        createIssue.newIssueIstance[fieldToModifySelection.field] = undefined;
        // clear previous payload
        delete createIssue.requestJson[fieldToModifySelection.field];
        if (!canPickMany ? !!selected : !!selected && selected.length > 0) {
          // update user choices
          const newValueSelected: IPickValue[] = !canPickMany ? [selected] : [...selected];
          createIssue.newIssueIstance[fieldToModifySelection.field] = newValueSelected.map((value: any) => value.label).join(' ');
          // assignee/reporter want a name prop and NOT id or key
          if (createIssue.isAssigneeOrReporterField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.name);
            createIssue.requestJson[fieldToModifySelection.field] = { name: !canPickMany ? values[0] : values };
          }
          // straight string or string[]
          if (
            createIssue.isEpicLinkFieldSchema(fieldToModifySelection.fieldSchema) ||
            createIssue.isLabelsField(fieldToModifySelection.field) ||
            createIssue.isIssuelinksField(fieldToModifySelection.field) ||
            createIssue.isStringItems(fieldToModifySelection.fieldSchema)
          ) {
            const values = newValueSelected.map((value: any) => value.pickValue.key || value.pickValue.label);
            createIssue.requestJson[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }
          // save inward for issuelinksType
          if (createIssue.isIssuelinksTypeField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.inward);
            createIssue.requestJson[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }
          // update payload statndard way use id or key
          if (!createIssue.requestJson[fieldToModifySelection.field]) {
            let jsonField = '';
            // do not change order
            if (!jsonField && !!newValueSelected[0].pickValue.name) {
              jsonField = 'name';
            }
            if (!jsonField && !!newValueSelected[0].pickValue.id) {
              jsonField = 'id';
            }
            if (!jsonField && !!newValueSelected[0].pickValue.key) {
              jsonField = 'key';
            }
            const values = newValueSelected.map((value: any) => value.pickValue[jsonField]);
            createIssue.requestJson[fieldToModifySelection.field] = !canPickMany
              ? {
                  [jsonField]: values[0]
                }
              : values.map(value => {
                  return { [jsonField]: value };
                });
          }
        }
      } else {
        vscode.window.showErrorMessage(`Debug msg - type not managed ${fieldToModifySelection.fieldSchema.type}`);
      }
    }
  }
};
