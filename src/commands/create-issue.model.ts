// statuses for new issue loop
export const NEW_ISSUE_STATUS = {
  STOP: -1,
  CONTINUE: 0,
  INSERT: 1
};

export interface IIssueField {
  [key: string]: any;
}

// items available inside the selector
export const NEW_ISSUE_FIELDS = {
  ISSUE_LINKS_TYPES: {
    field: 'issuelinksTypes',
    label: 'Linked issue type',
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
