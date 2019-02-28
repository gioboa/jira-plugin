import * as vscode from 'vscode';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, gitIntegration, issuesExplorer, logger, notifications, statusBar, utilities } from '../services';
import { IIssue, IJira, IProject, IStatus, IWorkingIssue } from '../services/http.model';
import { Jira } from '../services/http.service';
import { CONFIG, LOADING, NO_WORKING_ISSUE } from '../shared/constants';

export interface IState {
  jira: IJira;
  context: vscode.ExtensionContext;
  channel: vscode.OutputChannel;
  documentLinkDisposable: vscode.Disposable;
  statuses: IStatus[];
  projects: IProject[];
  issues: IIssue[];
  currentFilter: string;
  currentJQL: string;
  workingIssue: IWorkingIssue;
}

// initial state
const state: IState = {
  jira: undefined as any,
  context: undefined as any,
  channel: undefined as any,
  documentLinkDisposable: undefined as any,
  statuses: [],
  projects: [],
  issues: [],
  currentFilter: LOADING.text,
  currentJQL: '',
  workingIssue: {
    issue: new NoWorkingIssuePick().pickValue,
    trackingTime: 0,
    awayTime: 0
  }
};

export default state;

export const connectToJira = async (): Promise<void> => {
  try {
    state.jira = new Jira();
    // save statuses and projects in the global state
    state.statuses = await state.jira.getStatuses();
    addAdditionalStatuses();
    state.statuses.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    state.projects = utilities.hideProjects(await state.jira.getProjects());
    utilities.createDocumentLinkProvider(state.projects);
    statusBar.updateWorkingProjectItem('');

    const project = configuration.get(CONFIG.WORKING_PROJECT);
    // refresh Jira explorer list
    if (project) {
      // start notification service
      notifications.startNotificationsWatcher();
      await vscode.commands.executeCommand('jira-plugin.defaultIssuesCommand');
    } else {
      vscode.window.showWarningMessage("Working project isn't set.");
    }
  } catch (err) {
    configuration.set(CONFIG.WORKING_PROJECT, '');
    setTimeout(() => {
      statusBar.updateWorkingProjectItem('');
    }, 1000);
    changeStateIssues('', '', []);
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
};

export const canExecuteJiraAPI = (): boolean => {
  return state.jira && configuration.isValid();
};

export const verifyCurrentProject = (project: string | undefined): boolean => {
  return !!project && state.projects.filter((prj: IProject) => prj.key === project).length > 0;
};

export const changeStateProject = (project: string): void => {
  if (configuration.get(CONFIG.WORKING_PROJECT) !== project) {
    configuration.set(CONFIG.WORKING_PROJECT, project);
    // update project item in the status bar
    statusBar.updateWorkingProjectItem(project);
    // loading in Jira explorer
    changeStateIssues(LOADING.text, '', []);
    // start notification service
    notifications.startNotificationsWatcher();
    // launch search for the new project
    setTimeout(() => vscode.commands.executeCommand('jira-plugin.defaultIssuesCommand'), 1000);
  }
};

export const changeStateIssues = (filter: string, jql: string, issues: IIssue[]): void => {
  state.currentFilter = filter;
  state.currentJQL = jql;
  state.issues = issues;
  issuesExplorer.refresh();
};

export const changeStateWorkingIssue = async (issue: IIssue, trackingTime: number): Promise<void> => {
  if (issue.key !== NO_WORKING_ISSUE.key) {
    await gitIntegration.switchToWorkingTicketBranch(issue);
  }
  const awayTime: number = 0; // FIXME: We don't need awayTime when changing issues, not sure best way to handle this.
  state.workingIssue = { issue, trackingTime, awayTime };
  statusBar.updateWorkingIssueItem(false);
};

export const incrementStateWorkingIssueTimePerSecond = (): void => {
  state.workingIssue.trackingTime += 1;
  // prevent writing to much on storage
  if (state.workingIssue.trackingTime % 60 === 0) {
    if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      configuration.setGlobalWorkingIssue(state.workingIssue);
    }
  }
};

// verify if it's the current working issue
export const isWorkingIssue = (issueKey: string): boolean => {
  if (issueKey === state.workingIssue.issue.key) {
    vscode.window.showErrorMessage(`Issue ${issueKey} has pending worklog. Resolve the conflict and retry the action.`);
  }
  return issueKey === state.workingIssue.issue.key;
};

export const addAdditionalStatuses = () => {
  try {
    const additionalStatuses = configuration.get(CONFIG.ADDITIONAL_STATUSES);
    if (!!additionalStatuses) {
      const list = additionalStatuses.split(',');
      list.forEach((status: string) => {
        const newStatus = status.trim();
        if (!!newStatus && !state.statuses.find(el => el.name.toLowerCase() === newStatus.toLowerCase())) {
          state.statuses.push({
            description: newStatus,
            name: newStatus
          });
        }
      });
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
};
