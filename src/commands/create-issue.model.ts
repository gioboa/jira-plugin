// statuses for new issue loop
export const NEW_ISSUE_STATUS = {
  STOP: -1,
  CONTINUE: 0,
  INSERT: 1
};

export interface INewIssue {
  summary: string | undefined;
  description: string | undefined;
}

// items available inside the selector
export const NEW_ISSUE_FIELDS = {
  SUMMARY: {
    field: 'summary',
    label: 'Summary :',
    description: 'Insert summary'
  },
  DESCRIPTION: {
    field: 'description',
    label: 'Description :',
    description: 'Insert description'
  },
  DIVIDER: {
    field: 'divider',
    label: '------',
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
