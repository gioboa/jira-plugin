import * as vscode from 'vscode';
import { configuration, logger, store } from '.';
import openIssueCommand from '../commands/open-issue';
import { CONFIG, SEARCH_MAX_RESULTS } from '../shared/constants';
import { ICreateIssueEpicList, IField, IFieldSchema, IIssue, IIssueType, ILabel } from './http.model';

export default class CreateIssueService {
  // this object store all user choices
  public newIssueIstance = <any>{};
  // this object store all available values for each field
  public preloadedListValues = <any>{};
  // this object store the selected values and is the payload for createIssue API
  public requestJson = <any>{};
  public issueTypeSelected: IIssueType | any;

  // statuses for new issue loop
  public NEW_ISSUE_STATUS = {
    STOP: -1,
    CONTINUE: 0,
    INSERT: 1
  };

  // items available inside the selector
  public NEW_ISSUE_FIELDS = {
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

  constructor() {}

  public init(typeSelected: IIssueType | undefined) {
    this.newIssueIstance = {};
    this.preloadedListValues = {};
    this.requestJson = {};
    this.issueTypeSelected = typeSelected;
  }

  public get project(): string {
    return this.newIssueIstance.project;
  }

  public get mandatoryFieldsOk(): boolean {
    const fields = this.issueTypeSelected.fields;
    for (const key in fields) {
      if (!!fields[key].required && !this.requestJson[key]) {
        // output log useful for remote debug
        logger.printErrorMessageInOutput(`${key} field missing : ${JSON.stringify(fields[key])}`);
        return false;
      }
    }
    return true;
  }

  public getField(fieldName: string): IField {
    return this.issueTypeSelected.fields[fieldName];
  }

  public getPickValue(value: any): string {
    return value.inward || value.name || value.value || value.key || value.label || Object.values(value)[0]; // do not change order
  }

  // define if the selector can have multiple choices
  public isCanPickMany(field: any) {
    return this.isArrayType(field.fieldSchema.type) && !this.isIssuelinksField(field.field) && !this.isSprintFieldSchema(field.fieldSchema);
  }

  public isAssigneeOrReporterField(fieldName: string) {
    return fieldName.toLowerCase() === 'assignee' || fieldName.toLowerCase() === 'reporter';
  }

  public isEpicLinkFieldSchema(fieldSchema: IFieldSchema) {
    return !!fieldSchema.custom && fieldSchema.custom.toLowerCase() === 'com.pyxis.greenhopper.jira:gh-epic-link';
  }

  public isSprintFieldSchema(fieldSchema: IFieldSchema) {
    return !!fieldSchema.custom && fieldSchema.custom.toLowerCase() === 'com.pyxis.greenhopper.jira:gh-sprint';
  }

  public isLabelsField(fieldName: string) {
    return fieldName.toLowerCase() === 'labels';
  }

  public isArrayOfStringField(fieldSchema: IFieldSchema) {
    return this.isArrayType && (fieldSchema.items || '').toLowerCase() === 'string';
  }

  public isIssuelinksTypeField(fieldName: string) {
    return fieldName === this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field;
  }

  public isIssuelinksField(fieldName: string) {
    return fieldName.toLowerCase() === 'issuelinks';
  }

  public isArrayType(type: string) {
    return type.toString().toLowerCase() === 'array';
  }

  public populateNewIssue(data: {}) {
    this.newIssueIstance = { ...this.newIssueIstance, ...data };
  }

  public populateRequest(data: {}) {
    this.requestJson = { ...this.requestJson, ...data };
  }

  // custom behavior for some custom/particular fields
  public async manageSpecialFields(fieldName: string) {
    const field = this.getField(fieldName);
    if (this.isAssigneeOrReporterField(fieldName)) {
      // assignee autoCompleteUrl sometimes don't work, I use custom one
      // this.preloadedListValues[fieldName] = await store.state.jira.customRequest('GET', field.autoCompleteUrl);
      this.preloadedListValues[fieldName] = await store.state.jira.getAssignees(this.project);
    }
    if (this.isEpicLinkFieldSchema(field.schema)) {
      const response = await store.state.jira.getCreateIssueEpics(configuration.get(CONFIG.WORKING_PROJECT), SEARCH_MAX_RESULTS);
      // format issues in standard way
      if (!!response && !!response.epicLists) {
        const list: IIssue[] = [];
        (response.epicLists || []).forEach((epicList: ICreateIssueEpicList) => {
          epicList.epicNames.forEach((epic: any) => {
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
        this.preloadedListValues[fieldName] = list || [];
      }
    }
    if (this.isSprintFieldSchema(field.schema)) {
      const response = await store.state.jira.getSprints();
      this.preloadedListValues[fieldName] = response.suggestions || [];
    }
    if (this.isLabelsField(fieldName)) {
      const response = await store.state.jira.customRequest('GET', field.autoCompleteUrl);
      this.preloadedListValues[fieldName] = (response.suggestions || []).map((entry: ILabel) => {
        entry.key = entry.label;
        entry.description = '';
        return entry;
      });
    }
    if (this.isIssuelinksField(fieldName)) {
      const response = await store.state.jira.customRequest('GET', field.autoCompleteUrl);
      for (const [key, value] of Object.entries(response)) {
        if (value instanceof Array) {
          if (!!value[0] && !!value[0].issues && value[0].issues instanceof Array) {
            this.preloadedListValues[fieldName] = value[0].issues;
          }
        }
      }
      if (!!this.preloadedListValues[fieldName]) {
        // issueLinkedType field
        const types = await store.state.jira.getAvailableLinkIssuesType();
        this.preloadedListValues[this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field] = types.issueLinkTypes || [];
      }
    }
  }

  public async retrieveValues(fieldName: string): Promise<void> {
    const field = this.getField(fieldName);
    if (field.schema.type !== 'string' && field.schema.type !== 'number') {
      // those types are not managed
      if (
        !this.isEpicLinkFieldSchema(field.schema) &&
        !this.isSprintFieldSchema(field.schema) &&
        ((!!field.schema.custom && (!field.allowedValues && !field.autoCompleteUrl)) ||
          field.schema.type === 'date' ||
          field.schema.type === 'timetracking')
      ) {
        // output log useful for remote debug
        logger.jiraPluginDebugLog(`field`, JSON.stringify(field));
        field.hideField = true;
      } else {
        // first of first special fields
        const wait = await this.manageSpecialFields(fieldName);
        // if the field has autoComplete Url property we use that for retrieve available values
        if (!this.preloadedListValues[fieldName] && !!field.autoCompleteUrl) {
          try {
            // here the Jira API call
            const response = await store.state.jira.customRequest('GET', field.autoCompleteUrl);
            for (const value of Object.values(response)) {
              // I assume those are the values because it's an array
              if (value instanceof Array) {
                this.preloadedListValues[fieldName] = value;
              }
            }
          } catch (e) {
            this.preloadedListValues[fieldName] = [];
          }
        }
        // if the field has allowedValues we use that for get all the values
        if (!this.preloadedListValues[fieldName] && !!field.allowedValues) {
          this.preloadedListValues[fieldName] = field.allowedValues;
        }
        // hide field if there aren't values
        if (!this.preloadedListValues[fieldName] || this.preloadedListValues[fieldName].length === 0) {
          field.hideField = true;
        }
      }
    }
  }

  // if there is issuelinks field we need also of issuelinksType
  // so we add the field in selector available items
  public addDefaultIssueLinkTypesIfNessesary(newIssuePicks: any[]) {
    const field = this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field;
    if (this.preloadedListValues[field]) {
      // use previous selection or force the first type
      newIssuePicks.push({
        field,
        label: this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.label,
        description: this.requestJson[field] || this.preloadedListValues[field][0].inward,
        fieldSchema: {
          type: 'custom'
        }
      });
      this.requestJson[field] = this.requestJson[field] || this.preloadedListValues[field][0].inward;
    }
  }

  // issuelinks what update property in the payload
  public generateUpdateJson(): any {
    // if user select some issuelinks
    if (this.requestJson[this.NEW_ISSUE_FIELDS.ISSUE_LINKS.field]) {
      // find the whole type from user field selection
      const type = this.preloadedListValues[this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field].find(
        (type: any) => type.inward === this.requestJson[this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field]
      );
      if (!type) {
        return undefined;
      }
      const issueLink = this.requestJson[this.NEW_ISSUE_FIELDS.ISSUE_LINKS.field];
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
  }

  public async insertNewTicket(): Promise<void> {
    // create update json for issuelinks fields
    const update = this.generateUpdateJson();
    // clean fields payload
    delete this.requestJson[this.NEW_ISSUE_FIELDS.ISSUE_LINKS.field];
    delete this.requestJson[this.NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field];
    // create the final payload
    let payload;
    payload = { fields: { ...this.requestJson } };
    if (!!update) {
      payload = { ...payload, update: { ...update } };
    }
    const createdIssue = await store.state.jira.createIssue(payload);
    if (!!createdIssue && !!createdIssue.key) {
      // if the response is ok, we will open the created issue
      const action = await vscode.window.showInformationMessage('Issue created', 'Open in browser');
      if (action === 'Open in browser') {
        openIssueCommand(createdIssue.key);
      }
    }
  }
}
