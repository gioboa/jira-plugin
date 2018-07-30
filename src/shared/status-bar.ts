import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import state, { incrementStateWorkingIssueTimePerSecond } from '../state/state';
import { getConfigurationByKey, getGlobalWorkingIssue, setGlobalWorkingIssue } from './configuration';
import { CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from './constants';
import { secondsToHHMMSS } from './utilities';
const awayTimeout = 60 * 60; // TODO: this value should come from in the settings file

export class StatusBarManager {
  private workingProjectItem: vscode.StatusBarItem;
  private workingIssueItem: vscode.StatusBarItem;
  private intervalId: NodeJS.Timer | undefined;

  constructor() {
    this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
  }

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
    return (
      `$(watch) ` + (workingIssue.issue.key !== NO_WORKING_ISSUE.key ? 
          `Working Issue: - ${workingIssue.issue.key || ''} ${secondsToHHMMSS(workingIssue.trackingTime) || ''}` +
            (workingIssue.awayTime === 0 ? `` : workingIssue.awayTime > 0 ? `($(timer_off) - ${secondsToHHMMSS(awayTimeout - workingIssue.awayTime)})` : `$(timer_off) - Away too long, issue timer paused.`) 
          : NO_WORKING_ISSUE.text)
    );
  }

  public updateWorkingIssueItem(checkGlobalStore: boolean): void {
    let issue;
    if (checkGlobalStore) {
      issue = getGlobalWorkingIssue(state.context);
      if (!!issue) {
        vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', JSON.parse(issue));
        setGlobalWorkingIssue(state.context, undefined);
        return;
      }
    }

    this.clearWorkingIssueInterval();
    if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      this.startWorkingIssueInterval();
    } else {
      setGlobalWorkingIssue(state.context, undefined);
    }
    this.workingIssueItem.tooltip = this.workingIssueItemTooltip(state.workingIssue);
    this.workingIssueItem.command = 'jira-plugin.setWorkingIssueCommand';
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
        if (vscode.window.state.focused) {
            // If we are coming back from an away period catch up our logging time
            // If the away time was > awayTimeout, workingIssue.awayTime will be -1, so we won't log the away time.
            if (state.workingIssue.awayTime && state.workingIssue.awayTime > 0) {
                state.workingIssue.trackingTime += state.workingIssue.awayTime;
            }
            // Clear the away timer
            state.workingIssue.awayTime = 0;
            // Update as normal
            incrementStateWorkingIssueTimePerSecond();
            this.workingIssueItem.text = this.workingIssueItemText(state.workingIssue);
        } else {
            // If we are away from the Window capture the time, if it's less than our awayTimeout
            if (state.workingIssue.awayTime >= 0) {
                if ((awayTimeout - state.workingIssue.awayTime) > 0) {
                    state.workingIssue.awayTime++;
                } else {
                    // We've been away longer than the away timeout, we are probably working on something else
                    // we set the away timer to -1 to disable it until the next away period
                    state.workingIssue.awayTime = -1;
                    console.log('Away for too long... not going to log away time against working issue');
                }
            }
        }
    }, 1000);
  }

  public async dispose(): Promise<void> {
    this.clearWorkingIssueInterval();
    this.workingIssueItem.dispose();
    this.workingProjectItem.dispose();
  }
}
