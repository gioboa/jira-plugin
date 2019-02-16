import { IFieldSchema } from '../http/api.model';
import { logger } from '../services';

// statuses for new issue loop
export const NEW_ISSUE_STATUS = {
  STOP: -1,
  CONTINUE: 0,
  INSERT: 1
};

// items available inside the selector
export const NEW_ISSUE_FIELDS = {
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
export const isCanPickMany = (field: any) => {
  return isTypeArray(field.fieldSchema.type) && !isIssuelinksField(field.field);
};

export const isAssigneeOrReporterField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'assignee' || fieldName.toLowerCase() === 'reporter';
};

export const isEpicLinkFieldSchema = (fieldSchema: IFieldSchema) => {
  return !!fieldSchema.custom && fieldSchema.custom.toLowerCase() === 'com.pyxis.greenhopper.jira:gh-epic-link';
};

export const isLabelsField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'labels';
};

export const isStringItems = (fieldSchema: IFieldSchema) => {
  return (fieldSchema.items || '').toLowerCase() === 'string';
};

export const isIssuelinksTypeField = (fieldName: string) => {
  return fieldName === NEW_ISSUE_FIELDS.ISSUE_LINKS_TYPES.field;
};

export const isIssuelinksField = (fieldName: string) => {
  return fieldName.toLowerCase() === 'issuelinks';
};

const isTypeArray = (type: string) => {
  return type.toString().toLowerCase() === 'array';
};

export const mandatoryFieldsOk = (fields: any, fieldsRequest: any): boolean => {
  for (const key in fields) {
    if (!!fields[key].required && !(<any>fieldsRequest)[key]) {
      // output log useful for remote debug
      logger.printErrorMessageInOutput(`${key} field missing : ${JSON.stringify(fields[key])}`);
      return false;
    }
  }
  return true;
};
