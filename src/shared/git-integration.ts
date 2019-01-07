import * as vscode from 'vscode';
import { EventEmitter } from 'events';

import state, { changeStateWorkingIssue, changeStateProject } from '../state/state';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
/**
 * TODO: overengineering. Implement simplier solution
 */
class BranchWatcher extends EventEmitter {
  static EVENTS = {
    BRANCH_CHANED: 'branch:changed'
  };

  git: vscode.Extension<any> | undefined;

  constructor() {
    super();
    this.git = vscode.extensions.getExtension('vscode.git');
    this.startWatchingBranchChange();
  }

  public async getHeadBranch(): Promise<string | void> {
    if (!this.git) {
      return;
    }

    const activated = await this.git.activate();
    const api = activated.getAPI(1);
    const [repo] = api.repositories;
    const head = repo && repo.state && repo.state.HEAD;

    return head && head.name;
  }

  public dispose(): any {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.removeAllListeners();
  }

  public get currentBranch(): string | undefined {
    return this._currentBranch;
  }

  private _currentBranch: string | undefined;
  private interval: any;

  /**
   * TODO: there should be a better way of observing changes
   */
  private startWatchingBranchChange(): void {
    this.interval = setInterval(async () => {
      const actualBranch = await this.getHeadBranch();
      if (actualBranch !== this._currentBranch) {
        this.emit(BranchWatcher.EVENTS.BRANCH_CHANED, actualBranch, this._currentBranch);
      }

      this._currentBranch = actualBranch || undefined;
    }, 1000); // FIXME: hardcoded value
  }
}

interface Ticket {
  project: string;
  issue: string;
}

export class GitIntegration {
  private enabled = false;
  private configWatcher: vscode.Disposable;
  private watcher: BranchWatcher | undefined;
  private currentBranch: string | undefined;

  get isEnabled(): boolean {
    return !!getConfigurationByKey(CONFIG.GIT_INTEGRATION_ENABLED);
  }

  constructor() {
    this.configWatcher = vscode.workspace.onDidChangeConfiguration(() => this.toggleWatcher());

    this.toggleWatcher();
  }

  private toggleWatcher(enabled = this.isEnabled): void {
    if (enabled !== this.enabled) {
      enabled ? this.subscribeToWatcher() : this.disposeWatcher();
    }

    this.enabled = enabled;
  }

  private onBranchChanged(newBranch?: string, oldBrarnch?: string): void {
    this.currentBranch = newBranch;

    if (this.currentBranch) {
      const ticket = this.parseTicket(this.currentBranch);
      // TODO: consider user confirmation
      if (ticket) {
        this.setActiveTicket(ticket);
      }
    }
  }

  private parseTicket(branchName: string): Ticket | null {
    const matched = branchName.match(/([A-Z]+)-(\d+)/);

    return (
      matched && {
        project: matched[1],
        issue: matched[0]
      }
    );
  }

  private async setActiveTicket(ticket: Ticket): Promise<void> {
    try {
      const issue = await state.jira.getIssueByKey(ticket.issue);
      changeStateProject(ticket.project);
      changeStateWorkingIssue(issue, 0);
    } catch (e) {
      printErrorMessageInOutputAndShowAlert(e);
    }
  }

  private subscribeToWatcher() {
    this.watcher = new BranchWatcher();
    this.watcher.on(BranchWatcher.EVENTS.BRANCH_CHANED, this.onBranchChanged.bind(this));
  }

  private disposeWatcher() {
    return this.watcher && this.watcher.dispose();
  }

  public dispose(): any {
    this.configWatcher.dispose();
  }
}
