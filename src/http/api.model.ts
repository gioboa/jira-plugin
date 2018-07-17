export interface Jira {
  serverInfo(): Promise<IServerInfo>;
  search(params: { jql: string }): Promise<IIssues>;
  getProjects(): Promise<IProject[]>;
  getStatuses(): Promise<IStatus[]>;
  getTransitions(issue: string): Promise<ITransitions>;
  doTransition(issue: string, body: IDoTransition): Promise<void>;
  getAssignees(param: string): Promise<IAssignee[]>;
  assignIssue(issue: string, body: IAssignIssue): Promise<void>;
  addNewComment(issue: string, body: IAddComment): Promise<IAddCommentResponse>;
  addWorkLog(issue: string, body: IAddWorkLog): Promise<void>;
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
  statusCategory: any;
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

export interface IDoTransition {
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

export interface IAssignIssue {
  name: string;
}

export interface IAddComment {
  body: string;
}

export interface IAddCommentResponse {
  id: string;
}

export interface IWorkingIssue {
  issue: IIssue;
  timePerSecond: number;
}

export interface IAddWorkLog {
  timeSpentSeconds: number;
  comment?: string;
}
