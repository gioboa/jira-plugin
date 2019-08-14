import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { configuration, issueHelper, logger, selectValues, store } from '../services';
import { IPickValue } from '../services/configuration.model';
import { CONFIG } from '../shared/constants';

export default async function createIssue(issueItem: IssueItem): Promise<void> {
  const project = configuration.get(CONFIG.WORKING_PROJECT);
  if (store.verifyCurrentProject(project)) {
    try {
      // first of first we decide the type of the ticket
      const availableTypes = await store.state.jira.getAllIssueTypesWithFields(project);
      if (!!availableTypes) {
        // here the user select which type of issue create
        issueHelper.init(await selectValues.selectIssueType(false, availableTypes));
        if (!!issueHelper.issueTypeSelected) {
          // store project
          issueHelper.populateNewIssue({ project });
          // store issueType and project in payload
          // user cannot modify the values
          issueHelper.populateRequest({
            issuetype: {
              id: issueHelper.issueTypeSelected.id
            },
            project: {
              key: project
            }
          });
          let loopStatus = issueHelper.NEW_ISSUE_STATUS.CONTINUE;
          // this variable is used for retrieve only one time the available values inside the loop
          let executeretrieveValues = true;
          while (loopStatus === issueHelper.NEW_ISSUE_STATUS.CONTINUE) {
            // all selector available items
            const newIssuePicks = [];
            for (const fieldName in issueHelper.issueTypeSelected.fields) {
              // type and project forced before in the payload
              if (fieldName !== 'issuetype' && fieldName !== 'project') {
                // load values for every field if necessary
                if (executeretrieveValues) {
                  await issueHelper.retrieveValues(fieldName);
                }
                // if there is issuelinks field we need also of issuelinksType
                // so we add the field in selector available items
                if (fieldName === issueHelper.NEW_ISSUE_FIELDS.ISSUE_LINKS.field) {
                  issueHelper.addDefaultIssueLinkTypesIfNessesary(newIssuePicks);
                }
                const field = issueHelper.getField(fieldName);
                if (!field.hideField) {
                  // create the item, use preselected value or default label 'Insert + fieldName'
                  newIssuePicks.push({
                    field: fieldName,
                    label: `${issueHelper.issueTypeSelected.fields[fieldName].required ? '$(star) ' : ''}${field.name}`,
                    description: !!issueHelper.newIssueIstance[fieldName]
                      ? issueHelper.newIssueIstance[fieldName].toString()
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
                field: issueHelper.NEW_ISSUE_FIELDS.DIVIDER.field,
                label: issueHelper.NEW_ISSUE_FIELDS.DIVIDER.label,
                description: issueHelper.NEW_ISSUE_FIELDS.DIVIDER.description
              },
              {
                field: issueHelper.NEW_ISSUE_FIELDS.INSERT_ISSUE.field,
                label: issueHelper.NEW_ISSUE_FIELDS.INSERT_ISSUE.label,
                description: issueHelper.NEW_ISSUE_FIELDS.INSERT_ISSUE.description
              },
              {
                field: issueHelper.NEW_ISSUE_FIELDS.EXIT.field,
                label: issueHelper.NEW_ISSUE_FIELDS.EXIT.label,
                description: issueHelper.NEW_ISSUE_FIELDS.EXIT.description
              }
            );
            // second selector with all the fields
            const fieldToModifySelection = await vscode.window.showQuickPick(newIssuePicks, {
              placeHolder: `Insert Jira issue`,
              matchOnDescription: true
            });
            // manage the selected field from selector
            if (!!fieldToModifySelection && fieldToModifySelection.field !== issueHelper.NEW_ISSUE_FIELDS.DIVIDER.field) {
              switch (fieldToModifySelection.field) {
                case issueHelper.NEW_ISSUE_FIELDS.INSERT_ISSUE.field:
                  // check if the mandatory field are populated, if not, we go on
                  loopStatus = issueHelper.mandatoryFieldsOk ? issueHelper.NEW_ISSUE_STATUS.INSERT : loopStatus;
                  break;
                case issueHelper.NEW_ISSUE_FIELDS.EXIT.field:
                  loopStatus = issueHelper.NEW_ISSUE_STATUS.STOP;
                  break;
                default:
                  // with the field selected values populate the palyload
                  await manageSelectedField(fieldToModifySelection);
              }
            }
          }
          if (loopStatus === issueHelper.NEW_ISSUE_STATUS.INSERT) {
            // Jira create issue API
            await issueHelper.insertNewTicket();
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
        label: issueHelper.getPickValue(value),
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
        issueHelper.newIssueIstance[fieldToModifySelection.field] = text;
        // update payload
        if (issueHelper.isIssueTimetrackingOriginalEstimateField(fieldToModifySelection.field)) {
          issueHelper.requestJson[issueHelper.timetrakingJsonField] = {
            ...issueHelper.requestJson[issueHelper.timetrakingJsonField],
            originalEstimate: text
          };
        } else if (issueHelper.isIssueTimetrackingRemainingEstimateField(fieldToModifySelection.field)) {
          issueHelper.requestJson[issueHelper.timetrakingJsonField] = {
            ...issueHelper.requestJson[issueHelper.timetrakingJsonField],
            remainingEstimate: text
          };
        } else {
          issueHelper.requestJson[fieldToModifySelection.field] = text;
        }
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
          issueHelper.newIssueIstance[fieldToModifySelection.field] = parseInt(text);
          // update payload
          issueHelper.requestJson[fieldToModifySelection.field] = parseInt(text);
        }
      }
      break;
    default: {
      // if there are some preloaded values for the field
      if (
        !!issueHelper.preloadedListValues[fieldToModifySelection.field] &&
        issueHelper.preloadedListValues[fieldToModifySelection.field].length > 0
      ) {
        const canPickMany = issueHelper.isCanPickMany(fieldToModifySelection);
        const selected = await vscode.window.showQuickPick<any>(
          generatePicks(issueHelper.preloadedListValues[fieldToModifySelection.field]),
          {
            placeHolder: `Insert value`,
            matchOnDescription: true,
            canPickMany
          }
        );
        // clear previous selection
        issueHelper.newIssueIstance[fieldToModifySelection.field] = undefined;
        // clear previous payload
        delete issueHelper.requestJson[fieldToModifySelection.field];
        if (!canPickMany ? !!selected : !!selected && selected.length > 0) {
          // update user choices
          const newValueSelected: IPickValue[] = !canPickMany ? [selected] : [...selected];
          issueHelper.newIssueIstance[fieldToModifySelection.field] = newValueSelected.map((value: any) => value.label).join(' ');
          // assignee/reporter want a name prop and NOT id or key
          if (issueHelper.isAssigneeOrReporterField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.name);
            issueHelper.requestJson[fieldToModifySelection.field] = { name: !canPickMany ? values[0] : values };
          }
          // straight string or string[]
          if (
            issueHelper.isEpicLinkFieldSchema(fieldToModifySelection.fieldSchema) ||
            issueHelper.isSprintFieldSchema(fieldToModifySelection.fieldSchema) ||
            issueHelper.isLabelsField(fieldToModifySelection.field) ||
            issueHelper.isIssuelinksField(fieldToModifySelection.field) ||
            issueHelper.isArrayOfStringField(fieldToModifySelection.fieldSchema)
          ) {
            const values = newValueSelected.map((value: any) => value.pickValue.id || value.pickValue.key || value.pickValue.label);
            issueHelper.requestJson[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }

          // save inward for issuelinksType
          if (issueHelper.isIssuelinksTypeField(fieldToModifySelection.field)) {
            const values = newValueSelected.map((value: any) => value.pickValue.inward);
            issueHelper.requestJson[fieldToModifySelection.field] = !canPickMany ? values[0] : values;
          }
          // update payload statndard way use id or key
          if (!issueHelper.requestJson[fieldToModifySelection.field]) {
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
            issueHelper.requestJson[fieldToModifySelection.field] = !canPickMany
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
