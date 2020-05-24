import * as vscode from 'vscode';
import { configuration, store, utilities } from '.';
import changeIssueStatus from '../commands/change-issue-status';
import { IssueItem } from '../explorer/item/issue-item';
import { CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from '../shared/constants';
import { IWorkingIssue } from './http.model';

export default class StatusBarService {
  private workingProjectItem: vscode.StatusBarItem;
  private workingIssueItem: vscode.StatusBarItem;
  private toggleWorkingIssueTimerItem: vscode.StatusBarItem;
  private intervalId: NodeJS.Timer | undefined;
  private awayTimeout = 30 * 60; // Default to 30 minutes
  constructor() {
    this.toggleWorkingIssueTimerItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
    this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 300);
    this.awayTimeout = configuration.get(CONFIG.TRACKING_TIME_MODE_HYBRID_TIMEOUT) * 60;
  }

  // setup working project item
  public async updateWorkingProjectItem(project: string, verifyStoredWorkingIssue: boolean): Promise<void> {
    if (!store.state.jira) {
      return;
    }
    this.workingProjectItem.tooltip = 'Set working project';
    this.workingProjectItem.command = 'jira-plugin.setWorkingProject';
    this.workingProjectItem.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);
    this.workingProjectItem.show();
    if (configuration.get(CONFIG.ENABLE_WORKING_ISSUE) && !!verifyStoredWorkingIssue) {
      this.verifyStoredWorkingIssue();
    }
  }

  private workingIssueItemTooltip(workingIssue: IWorkingIssue): string {
    return workingIssue.issue.key !== NO_WORKING_ISSUE.key ? workingIssue.issue.fields.summary : 'Set working issue';
  }

  private workingIssueItemText(workingIssue: IWorkingIssue): string {
    if (workingIssue.issue.key === NO_WORKING_ISSUE.key) {
      return NO_WORKING_ISSUE.text;
    }
    return `Working Issue: ${workingIssue.issue.key || ''}`;
  }

  public verifyStoredWorkingIssue(): void {
    let data;
    data = configuration.getGlobalWorkingIssue();
    if (!!data) {
      data = JSON.parse(data);
      // if there is a stored working issue we will use it
      if (data.issue.fields.project.key === configuration.get(CONFIG.WORKING_PROJECT)) {
        vscode.commands.executeCommand('jira-plugin.setWorkingIssue', data, undefined);
        configuration.setGlobalWorkingIssue(undefined);
        return;
      }
    }
    this.updateWorkingIssueItem();
  }

  // setup working issue item
  public updateWorkingIssueItem(): void {
    this.clearWorkingIssueInterval();
    if (store.state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
      if (configuration.get(CONFIG.TRACKING_TIME_MODE) !== TRACKING_TIME_MODE.NEVER) {
        this.startWorkingIssueInterval();
      }
    } else {
      // if user select NO_WORKING_ISSUE clear the stored working issue
      configuration.setGlobalWorkingIssue(undefined);
    }
    this.workingIssueItem.tooltip = this.workingIssueItemTooltip(store.state.workingIssue);
    this.workingIssueItem.command = 'jira-plugin.setWorkingIssue';
    store.state.workingIssue.awayTime = 0;
    this.workingIssueItem.text = this.workingIssueItemText(store.state.workingIssue);
    this.workingIssueItem.show();
    if (
      !!configuration.get(CONFIG.WORKING_ISSUE_CHANGE_STATUS_AFTER_SELECTION) &&
      store.state.workingIssue.issue.key !== NO_WORKING_ISSUE.key
    ) {
      changeIssueStatus(new IssueItem(store.state.workingIssue.issue));
    }
  }

  public clearWorkingIssueInterval(): void {
    if (this.intervalId) {
      this.toggleWorkingIssueTimer();
      if (store.state.workingIssue.issue.key === NO_WORKING_ISSUE.key) {
        this.toggleWorkingIssueTimerItem.hide();
      }
      clearInterval(this.intervalId);
    }
  }

  public startWorkingIssueInterval(): void {
    this.clearWorkingIssueInterval();
    this.updateToggleWorkingIssueTimerItem();
    this.intervalId = setInterval(() => {
      if (vscode.window.state.focused || configuration.get(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.ALWAYS) {
        if (configuration.get(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
          // If we are coming back from an away period catch up our logging time
          // If the away time was > awayTimeout, workingIssue.awayTime will be -1, so we won't log the away time.
          if (store.state.workingIssue.awayTime && store.state.workingIssue.awayTime > 0 && !store.state.workingIssue.stopped) {
            store.state.workingIssue.trackingTime += store.state.workingIssue.awayTime;
          }
          // Clear the away timer
          store.state.workingIssue.awayTime = 0;
        }
        // Update as normal
        store.incrementStateWorkingIssueTimePerSecond();
      } else if (configuration.get(CONFIG.TRACKING_TIME_MODE) === TRACKING_TIME_MODE.HYBRID) {
        // If we are away from the Window capture the time, if it's less than our awayTimeout
        if (store.state.workingIssue.awayTime >= 0) {
          if (this.awayTimeout - store.state.workingIssue.awayTime > 0) {
            store.state.workingIssue.awayTime++;
          } else {
            // We've been away longer than the away timeout, we are probably working on something else
            // we set the away timer to -1 to disable it until the next away period
            store.state.workingIssue.awayTime = -1;
          }
        }
      }
      this.toggleWorkingIssueTimerItem.text = this.toggleWorkingIssueTimerItemText(store.state.workingIssue);
    }, 1000);
  }

  public updateToggleWorkingIssueTimerItem(): void {
    this.toggleWorkingIssueTimerItem.tooltip = (store.state.workingIssue.stopped ? 'Play' : 'Stop') + ' working issue timer';
    this.toggleWorkingIssueTimerItem.command = 'jira-plugin.toggleWorkingIssueTimer';
    this.toggleWorkingIssueTimerItem.text = this.toggleWorkingIssueTimerItemText(store.state.workingIssue);
    if (configuration.get(CONFIG.TRACKING_TIME_MODE) !== TRACKING_TIME_MODE.NEVER && !!configuration.get(CONFIG.WORKING_ISSUE_SHOW_TIMER)) {
      this.toggleWorkingIssueTimerItem.show();
    } else {
      this.toggleWorkingIssueTimerItem.hide();
    }
  }

  private toggleWorkingIssueTimerItemText(workingIssue: IWorkingIssue): string {
    let text =
      ` $(watch) ${utilities.secondsToHHMMSS(workingIssue.trackingTime) || ''}` +
      (workingIssue.awayTime === 0
        ? ``
        : workingIssue.awayTime > 0
        ? ` $(history) ${utilities.secondsToHHMMSS(this.awayTimeout - workingIssue.awayTime)}`
        : ` $(history) Away too long, issue timer paused`);
    text += store.state.workingIssue.stopped ? ` $(play)` : ` $(primitive-square)`;
    return text;
  }

  public toggleWorkingIssueTimer(): void {
    store.state.workingIssue.stopped = !store.state.workingIssue.stopped;
    this.updateToggleWorkingIssueTimerItem();
  }

  public async dispose(): Promise<void> {
    this.clearWorkingIssueInterval();
    this.workingIssueItem.dispose();
    this.workingProjectItem.dispose();
  }
}
