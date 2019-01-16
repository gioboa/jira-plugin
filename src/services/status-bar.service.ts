import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import { CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from '../shared/constants';
import state, { incrementStateWorkingIssueTimePerSecond } from '../store/state';
import ConfigurationService from './configuration.service';
import { configuration, utilities } from '.';

export default class StatusBarService {
  private workingProjectItem: vscode.StatusBarItem;
  private workingIssueItem: vscode.StatusBarItem;
  private intervalId: NodeJS.Timer | undefined;
  private awayTimeout = 30 * 60; // Default to 30 minutes
  constructor(configuration: ConfigurationService) {
    this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
    this.awayTimeout = parseInt(configuration.getConfigurationByKey(CONFIG.TRACKING_TIME_MODE_HYBRID_TIMEOUT) || '30', 10) * 60;
  }

  // setup working project item
  public async updateWorkingProjectItem(project: string): Promise<void> {
    if (!state.jira) {
      return;
    }
    if (!project) {
      project = (await configuration.getConfigurationByKey(CONFIG.WORKING_PROJECT)) || '';
    }
    this.workingProjectItem.tooltip = 'Set working project';
    this.workingProjectItem.command = 'jira-plugin.setWorkingProjectCommand';
    this.workingProjectItem.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);
    this.workingProjectItem.show();
    if (configuration.getConfigurationByKey(CONFIG.ENABLE_WORKING_ISSUE)) {
      this.updateWorkingIssueItem(true);
    }
  }

  private workingIssueItemTooltip(workingIssue: IWorkingIssue): string {
    return workingIssue.issue.key !== NO_WORKING_ISSUE.key ? workingIssue.issue.fields.summary : 'Set working issue';
  }

  private workingIssueItemText(workingIssue: IWorkingIssue): string {
    return workingIssue.issue.key !== NO_WORKING_ISSUE.key
      ? `Working Issue: ${workingIssue.issue.key || ''} $(watch) ${utilities.secondsToHHMMSS(workingIssue.trackingTime) || ''}` +
          (workingIssue.awayTime === 0
            ? ``
            : workingIssue.awayTime > 0
            ? ` $(history) ${utilities.secondsToHHMMSS(this.awayTimeout - workingIssue.awayTime)}`
            : ` $(history) Away too long, issue timer paused`)
      : NO_WORKING_ISSUE.text;
  }

  // setup working issue item
  public updateWorkingIssueItem(checkGlobalStore: boolean): void {
    let issue;
    // verify stored working issue
    if (checkGlobalStore) {
      issue = configuration.getGlobalWorkingIssue(state.context);
      if (!!issue) {
        // if there is a stored working issue we will use it
        vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', JSON.parse(issue), undefined);
        configuration.setGlobalWorkingIssue(state.context, undefined);
        return;
      }
    }

    this.clearWorkingIssueInterval();
    if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      this.startWorkingIssueInterval();
    } else {
      // if user select NO_WORKING_ISSUE clear the stored working issue
      configuration.setGlobalWorkingIssue(state.context, undefined);
    }
    this.workingIssueItem.tooltip = this.workingIssueItemTooltip(state.workingIssue);
    this.workingIssueItem.command = 'jira-plugin.setWorkingIssueCommand';
    state.workingIssue.awayTime = 0;
    this.workingIssueItem.text = this.workingIssueItemText(state.workingIssue);
    this.workingIssueItem.show();
  }

  public clearWorkingIssueInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public startWorkingIssueInterval(): void {
    this.clearWorkingIssueInterval();
    this.intervalId = setInterval(() => {
      if (vscode.window.state.focused || configuration.getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.ALWAYS) {
        if (configuration.getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
          // If we are coming back from an away period catch up our logging time
          // If the away time was > awayTimeout, workingIssue.awayTime will be -1, so we won't log the away time.
          if (state.workingIssue.awayTime && state.workingIssue.awayTime > 0) {
            state.workingIssue.trackingTime += state.workingIssue.awayTime;
          }
          // Clear the away timer
          state.workingIssue.awayTime = 0;
        }
        // Update as normal
        incrementStateWorkingIssueTimePerSecond();
      } else if (configuration.getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
        // If we are away from the Window capture the time, if it's less than our awayTimeout
        if (state.workingIssue.awayTime >= 0) {
          if (this.awayTimeout - state.workingIssue.awayTime > 0) {
            state.workingIssue.awayTime++;
          } else {
            // We've been away longer than the away timeout, we are probably working on something else
            // we set the away timer to -1 to disable it until the next away period
            state.workingIssue.awayTime = -1;
          }
        }
      }
      this.workingIssueItem.text = this.workingIssueItemText(state.workingIssue);
    }, 1000);
  }

  public async dispose(): Promise<void> {
    this.clearWorkingIssueInterval();
    this.workingIssueItem.dispose();
    this.workingProjectItem.dispose();
  }
}
