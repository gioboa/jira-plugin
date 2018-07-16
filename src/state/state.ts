import * as vscode from 'vscode';
import { JiraExplorer } from '../explorer/jira-explorer';
import { Issue, Jira, Project, Status } from '../http/api.model';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configIsCorrect } from '../shared/configuration';
import { LOADING } from '../shared/constants';
import { StatusBarManager } from '../shared/status-bar';

export interface State {
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  statusBar: StatusBarManager;
  jiraExplorer: JiraExplorer;
  jira: Jira;
  statuses: Status[];
  projects: Project[];
  issues: Issue[];
  currentFilter: string;
  currentJQL: string;
  workingIssue: Issue;
}

const state: State = {
  jira: undefined as any,
  context: undefined as any,
  channel: undefined as any,
  statusBar: undefined as any,
  jiraExplorer: undefined as any,
  statuses: [],
  projects: [],
  issues: [],
  currentFilter: LOADING.text,
  currentJQL: '',
  workingIssue: new NoWorkingIssuePick().pickValue
};

export default state;

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configIsCorrect();
};

export const verifyCurrentProject = (project: string | undefined): boolean => {
  return !!project && state.projects.filter((prj: Project) => prj.key === project).length > 0;
};

export const changeIssuesInState = (filter: string, jql: string, issues: Issue[]): void => {
  state.currentFilter = filter;
  state.currentJQL = jql;
  state.issues = issues;
  state.jiraExplorer.refresh();
};

export const changeWorkingIssue = (newActiveIssue: Issue): void => {
  state.workingIssue = newActiveIssue;
  state.statusBar.updateWorkingIssueItem();
};
