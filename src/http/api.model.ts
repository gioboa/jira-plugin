export interface IJira {
  search(params: { jql: string; maxResults?: number }): Promise<IIssues>;
  getStatuses(): Promise<IStatus[]>;
  getProjects(): Promise<IProject[]>;
  getAssignees(param: { project: string; maxResults?: number }): Promise<IAssignee[]>;
  getTransitions(issueKey: string): Promise<ITransitions>;

  setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void>;
  setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void>;

  addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse>;
  addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void>;

  getAllIssueTypes(): Promise<IIssueType[]>;
  createIssue(params: ICreateIssue): Promise<any>;
}

export interface IServerInfo {
  version: string;
  versionNumbers: number[];
}

export interface IIssues {
  issues: IIssue[] | undefined;
  maxResults: number;
  startAt: number;
  total: number;
}

export interface IIssue {
  id: string;
  key: string;
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
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
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
      key: string;
    };
  };
}
