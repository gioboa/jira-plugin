import * as vscode from 'vscode';
import { configuration, gitIntegration, issuesExplorer, logger, notifications, statusBar, utilities } from '.';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { CONFIG, LOADING, NO_WORKING_ISSUE } from '../shared/constants';
import { IIssue, IProject } from './http.model';
import { Jira } from './http.service';
import { IState } from './store.model';

export default class StoreService {
  // initial state
  public state: IState = {
    jira: undefined as any,
    context: undefined as any,
    channel: undefined as any,
    documentLinkDisposable: undefined as any,
    config: undefined,
    statuses: [],
    projects: [],
    issues: [],
    currentSearch: {
      filter: LOADING.text,
      jql: ''
    },
    workingProject: '',
    workingIssue: {
      issue: new NoWorkingIssuePick().pickValue,
      trackingTime: 0,
      awayTime: 0
    }
  };

  public async connectToJira(): Promise<void> {
    try {
      this.state.jira = new Jira();
      // save statuses and projects in the global state
      this.state.statuses = await this.state.jira.getStatuses();
      this.addAdditionalStatuses();
      this.state.statuses.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

      this.state.projects = utilities.hideProjects(await this.state.jira.getProjects());
      utilities.createDocumentLinkProvider(this.state.projects);

      const project = configuration.get(CONFIG.WORKING_PROJECT);
      statusBar.updateWorkingProjectItem(project);
      // refresh Jira explorer list
      if (project) {
        this.state.workingProject = project;
        // start notification service
        notifications.startNotificationsWatcher();
        await vscode.commands.executeCommand('jira-plugin.defaultIssuesCommand');
      } else {
        vscode.window.showWarningMessage("Working project isn't set.");
      }
    } catch (err) {
      configuration.set(CONFIG.WORKING_PROJECT, '');
      this.state.workingProject = '';
      setTimeout(() => {
        statusBar.updateWorkingProjectItem('');
      }, 1000);
      this.changeStateIssues('', '', []);
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
  }

  public canExecuteJiraAPI(): boolean {
    return this.state.jira && configuration.isValid();
  }

  public verifyCurrentProject(project: string | undefined): boolean {
    return !!project && this.state.projects.filter((prj: IProject) => prj.key === project).length > 0;
  }

  public changeStateProject(project: string): void {
    if (this.state.workingProject !== project) {
      this.state.workingProject = project;
      configuration.set(CONFIG.WORKING_PROJECT, project);
      // update project item in the status bar
      statusBar.updateWorkingProjectItem(project);
      // loading in Jira explorer
      this.changeStateIssues(LOADING.text, '', []);
      // start notification service
      notifications.startNotificationsWatcher();
      // launch search for the new project
      setTimeout(() => vscode.commands.executeCommand('jira-plugin.defaultIssuesCommand'), 1000);
    }
  }

  public changeStateIssues(filter: string, jql: string, issues: IIssue[]): void {
    this.state.currentSearch.filter = filter;
    this.state.currentSearch.jql = jql;
    this.state.issues = issues;
    issuesExplorer.refresh();
  }

  public async changeStateWorkingIssue(issue: IIssue, trackingTime: number): Promise<void> {
    if (issue.key !== NO_WORKING_ISSUE.key) {
      await gitIntegration.switchToWorkingTicketBranch(issue);
    }
    const awayTime: number = 0; // FIXME: We don't need awayTime when changing issues, not sure best way to handle this.
    this.state.workingIssue = { issue, trackingTime, awayTime };
    statusBar.updateWorkingIssueItem(false);
  }

  public incrementStateWorkingIssueTimePerSecond(): void {
    this.state.workingIssue.trackingTime += 1;
    // prevent writing to much on storage
    if (this.state.workingIssue.trackingTime % 60 === 0) {
      if (this.state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
        configuration.setGlobalWorkingIssue(this.state.workingIssue);
      }
    }
  }

  // verify if it's the current working issue
  public isWorkingIssue(issueKey: string): boolean {
    if (issueKey === this.state.workingIssue.issue.key) {
      vscode.window.showErrorMessage(`Issue ${issueKey} has pending worklog. Resolve the conflict and retry the action.`);
    }
    return issueKey === this.state.workingIssue.issue.key;
  }

  public addAdditionalStatuses() {
    try {
      const additionalStatuses = configuration.get(CONFIG.ADDITIONAL_STATUSES);
      if (!!additionalStatuses) {
        const list = additionalStatuses.split(',');
        list.forEach((status: string) => {
          const newStatus = status.trim();
          if (!!newStatus && !this.state.statuses.find(el => el.name.toLowerCase() === newStatus.toLowerCase())) {
            this.state.statuses.push({
              description: newStatus,
              name: newStatus
            });
          }
        });
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
  }
}