export interface IJira {
  search(params: { jql: string; maxResults: number }): Promise<ISearch>;
  getStatuses(): Promise<IStatus[]>;
  getProjects(): Promise<IProject[]>;
  getAssignees(param: { project: string; maxResults: number }): Promise<IAssignee[]>;
  getTransitions(issueKey: string): Promise<ITransitions>;
  setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void>;
  setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void>;
  addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse>;
  addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void>;
  getAllIssueTypes(): Promise<IIssueType[]>;
  createIssue(params: ICreateIssue): Promise<any>;
  getAllPriorities(): Promise<IPriority[]>;
  getAllIssueTypesWithFields(project: string): Promise<IIssueType[]>;
  customApiCall(uri: string): Promise<any>;
  getFavoriteFilters(): Promise<IFavouriteFilter[]>;
  getAllEpics(maxResults: number): Promise<ISearch>;
  getLabels(baseUrl: string): Promise<{ suggestions: ILabel[] }>;
}

export interface IServerInfo {
  version: string;
  versionNumbers: number[];
}

export interface ISearch {
  issues: IIssue[] | undefined;
  maxResults: number;
  startAt: number;
  total: number;
}

export interface IIssue {
  id: string;
  key: string;
  description?: string;
  fields: {
    summary: string;
    description?: string;
    status: {
      name: string;
    };
  };
}

export interface IProject {
  key: string;
  expand: string;
  self: string;
  id: string;
  name: string;
}

export interface IStatus {
  description: string;
  name: string;
}

export interface ITransitions {
  transitions: ITransition[];
}

export interface ITransition {
  id: string;
  name: string;
  to: {
    name: string;
  };
}

export interface ISetTransition {
  transition: {
    id: string;
  };
}

export interface IAssignee {
  key: string;
  name: string;
  displayName: string;
  active: boolean;
}

export interface IAddComment {
  body: string;
}

export interface IAddCommentResponse {
  id: string;
}

export interface IWorkingIssue {
  issue: IIssue;
  trackingTime: number;
  awayTime: number;
}

export interface IAddWorkLog {
  timeSpentSeconds: number;
  comment?: string;
}

export interface IIssueType {
  id: string;
  description: string;
  name: string;
  subtask: boolean;
  fields: { [key: string]: IField };
}

export interface IField {
  hasDefaultValue: boolean;
  name: string;
  required: boolean;
  schema: IFieldSchema;
  allowedValues: any[];
  autoCompleteUrl: string;
  hideField?: boolean; // used internally for hide not managed fields
}

export interface IFieldSchema {
  type: string;
  items: string;
  system: string;
  custom?: string;
  customId?: string;
}

export interface ICreateIssue {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description: string;
    issuetype: {
      id: string;
    };
    assignee?: {
      name: string;
    };
    priority?: {
      id: string;
    };
  };
}

export interface IPriority {
  description: string;
  iconUrl: string;
  id: string;
  name: string;
  self: string;
  statusColor: string;
}

export interface ICreateMetadata {
  projectKeys: string;
  issuetypeIds?: string[];
  expand: string;
}

export interface IFavouriteFilter {
  description: string;
  editable: boolean;
  favourite: boolean;
  id: string;
  jql: string;
  name: string;
}

export interface ILabel {
  html: string;
  label: string;
  key?: string;
  description?: string;
}
