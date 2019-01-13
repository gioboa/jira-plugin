import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import state, { incrementStateWorkingIssueTimePerSecond } from '../state/state';
import { getConfigurationByKey, getGlobalWorkingIssue, setGlobalWorkingIssue } from './configuration';
import { CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from './constants';
import { secondsToHHMMSS } from './utilities';
const awayTimeout = parseInt(getConfigurationByKey(CONFIG.TRACKING_TIME_MODE_HYBRID_TIMEOUT) || '30', 10) * 60; // Default to 30 minutes

export class StatusBarManager {
  private workingProjectItem: vscode.StatusBarItem;
  private workingIssueItem: vscode.StatusBarItem;
  private intervalId: NodeJS.Timer | undefined;

  constructor() {
    this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
  }

  // setup working project item
  public async updateWorkingProjectItem(project: string): Promise<void> {
    if (!state.jira) {
      return;
    }
    if (!project) {
      project = (await getConfigurationByKey(CONFIG.WORKING_PROJECT)) || '';
    }
    this.workingProjectItem.tooltip = 'Set working project';
    this.workingProjectItem.command = 'jira-plugin.setWorkingProjectCommand';
    this.workingProjectItem.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);
    this.workingProjectItem.show();
    if (getConfigurationByKey(CONFIG.ENABLE_WORKING_ISSUE)) {
      this.updateWorkingIssueItem(true);
    }
  }

  private workingIssueItemTooltip(workingIssue: IWorkingIssue): string {
    return workingIssue.issue.key !== NO_WORKING_ISSUE.key ? workingIssue.issue.fields.summary : 'Set working issue';
  }

  private workingIssueItemText(workingIssue: IWorkingIssue): string {
    return workingIssue.issue.key !== NO_WORKING_ISSUE.key
      ? `Working Issue: ${workingIssue.issue.key || ''} $(watch) ${secondsToHHMMSS(workingIssue.trackingTime) || ''}` +
          (workingIssue.awayTime === 0
            ? ``
            : workingIssue.awayTime > 0
            ? ` $(history) ${secondsToHHMMSS(awayTimeout - workingIssue.awayTime)}`
            : ` $(history) Away too long, issue timer paused`)
      : NO_WORKING_ISSUE.text;
  }

  // setup working issue item
  public updateWorkingIssueItem(checkGlobalStore: boolean): void {
    let issue;
    // verify stored working issue
    if (checkGlobalStore) {
      issue = getGlobalWorkingIssue(state.context);
      if (!!issue) {
        // if there is a stored working issue we will use it
        vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', JSON.parse(issue), undefined);
        setGlobalWorkingIssue(state.context, undefined);
        return;
      }
    }

    this.clearWorkingIssueInterval();
    if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      this.startWorkingIssueInterval();
    } else {
      // if user select NO_WORKING_ISSUE clear the stored working issue
      setGlobalWorkingIssue(state.context, undefined);
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
      if (vscode.window.state.focused || getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.ALWAYS) {
        if (getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
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
      } else if (getConfigurationByKey(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
        // If we are away from the Window capture the time, if it's less than our awayTimeout
        if (state.workingIssue.awayTime >= 0) {
          if (awayTimeout - state.workingIssue.awayTime > 0) {
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
