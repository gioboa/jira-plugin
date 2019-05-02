export interface IJira {
  baseUrl: string;
  getCloudSession(): Promise<{ name: string; value: string }>;
  search(params: { jql: string; maxResults: number }): Promise<ISearch>;
  getStatuses(): Promise<IStatus[]>;
  getProjects(): Promise<IProject[]>;
  getIssueByKey(issueKey: string): Promise<IIssue>;
  getAssignees(project: string): Promise<IAssignee[]>;
  getTransitions(issueKey: string): Promise<ITransitions>;
  setTransition(params: { issueKey: string; transition: ISetTransition }): Promise<void>;
  setAssignIssue(params: { issueKey: string; assignee: string }): Promise<void>;
  addNewComment(params: { issueKey: string; comment: IAddComment }): Promise<IAddCommentResponse>;
  addWorkLog(params: { issueKey: string; worklog: IAddWorkLog }): Promise<void>;
  getAllIssueTypes(): Promise<IIssueType[]>;
  createIssue(params: ICreateIssue): Promise<any>;
  getAllPriorities(): Promise<IPriority[]>;
  getAllIssueTypesWithFields(project: string): Promise<IIssueType[]>;
  customRequest(method: 'GET' | 'POST', uri: string, headers?: {}, body?: {}): Promise<any>;
  getFavoriteFilters(): Promise<IFavouriteFilter[]>;
  getCreateIssueEpics(project: string, maxResults: number): Promise<ICreateIssueEpic>;
  getCreateIssueLabels(): Promise<{ suggestions: ILabel[] }>;
  getAvailableLinkIssuesType(): Promise<{ issueLinkTypes: IAvailableLinkIssuesType[] }>;
  getNotifications(lastId: string): Promise<INotifications>;
  markNotificationsAsReadUnread(payload: IMarkNotificationAsReadUnread): Promise<any>;
  getSprints(): Promise<{ allMatches: any[]; suggestions: ISprint[] }>;
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
    project: {
      id: string;
      key: string;
      name: string;
    };
    subtasks?: IIssue[];
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
  key?: string;
  required: boolean;
  schema: IFieldSchema;
  operations?: string[];
  allowedValues?: any[];
  autoCompleteUrl: string;
  hideField?: boolean; // used internally for hide not managed fields
}

export interface IFieldSchema {
  type: string;
  items?: string;
  system?: string;
  custom?: string;
  customId?: number;
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
  update?: {
    issuelinks: {
      add: {
        type: {
          name: string;
          inward: string;
          outward: string;
        };
        outwardIssue: {
          key: string;
        };
      };
    }[];
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

export interface ICreateIssueEpic {
  epicLists: ICreateIssueEpicList[];
}

export interface ICreateIssueEpicList {
  listDescriptor: string;
  epicNames: {
    isDone: boolean;
    key: string;
    name: string;
  }[];
}

export interface IAvailableLinkIssuesType {
  id: string;
  inward: string;
  name: string;
  outward: string;
  self: string;
}

export interface INotifications {
  data: INotification[];
  direct: boolean;
  pageInfo: {
    firstId: string;
    lastId: string;
  };
}

export interface INotification {
  id: string;
  notificationId?: string;
  title?: string;
  template?: string;
  objectId?: string;
  eventType?: string;
  timestamp?: string;
  metadata?: {
    content?: {
      id: string;
      title: string;
      url: string;
    };
    issue?: {
      summary: string;
      url: string;
      status: {
        id: number;
        name: string;
        categoryKey: string;
      };
      issueID: string;
      issueKey: string;
    };
    user1?: {
      atlassianId: string;
      name: string;
    };
  };
  users?: {
    [key: string]: string;
  };
  readState: 'read' | 'unread';
}

export interface IMarkNotificationAsReadUnread {
  ids: string[];
  toState: 'READ' | 'UNREAD';
}

export interface ISprint {
  name: string;
  id: number;
  stateKey: string;
  boardName: string;
  date: string;
}
