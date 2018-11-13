import { IAssignee, IIssueType } from '../http/api.model';

// statuses for new issue loop
export const NEW_ISSUE_STATUS = {
  STOP: -1,
  CONTINUE: 0,
  INSERT: 1
};

export interface INewIssue {
  type: IIssueType | undefined;
  summary: string | undefined;
  description: string | undefined;
  assignee: IAssignee | string | undefined;
}

// items available inside the selector
export const NEW_ISSUE_FIELDS = {
  TYPE: {
    field: 'type',
    label: 'Type * :',
    description: 'Select type'
  },
  SUMMARY: {
    field: 'summary',
    label: 'Summary * :',
    description: 'Insert summary'
  },
  DESCRIPTION: {
    field: 'description',
    label: 'Description * :',
    description: 'Insert description'
  },
  ASSIGNEE: {
    field: 'assignee',
    label: 'Assignee :',
    description: 'Select assignee'
  },
  DIVIDER: {
    field: 'divider',
    label: '--- * required ---',
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
