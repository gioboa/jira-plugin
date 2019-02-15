import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { logger } from '.';
import { IIssue } from '../http/api.model';
import { ACTIONS, CONFIG } from '../shared/constants';
import state, { changeStateProject } from '../store/state';
import ConfigurationService from './configuration.service';

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

export default class GitIntegrationService {
  private enabled = false;
  private configWatcher: vscode.Disposable;
  private watcher: BranchWatcher | undefined;
  private currentBranch: string | undefined;

  get isEnabled(): boolean {
    return !!this.configuration.get(CONFIG.GIT_INTEGRATION_ENABLED);
  }

  constructor(private configuration: ConfigurationService) {
    this.configWatcher = vscode.workspace.onDidChangeConfiguration(() => this.toggleWatcher());

    this.toggleWatcher();
  }

  private toggleWatcher(enabled = this.isEnabled): void {
    if (enabled !== this.enabled) {
      enabled ? this.subscribeToWatcher() : this.disposeWatcher();
    }

    this.enabled = enabled;
  }

  private async onBranchChanged(newBranch?: string, oldBrarnch?: string): Promise<void> {
    this.currentBranch = newBranch;
    if (this.currentBranch) {
      const ticket = this.parseTicket(this.currentBranch);
      if (ticket) {
        const issue = await state.jira.getIssueByKey(ticket.issue);
        // if issue exist and is different from current working issue
        if (issue && issue.key !== state.workingIssue.issue.key) {
          // modal
          const action = await vscode.window.showInformationMessage(
            `Jira plugin detected that current git branch can be related to a Jira issue. ` +
              `Do you want change current working project into ${ticket.project} and issue into ${ticket.issue}?`,
            ACTIONS.YES,
            ACTIONS.NO
          );
          if (action === ACTIONS.YES) {
            this.setCurrentWorkingProjectAndIssue(ticket, issue);
          }
        }
      }
    }
  }

  private parseTicket(branchName: string): Ticket | null {
    const matched = branchName.match(/([A-Z0-9]+)-(\d+)/);
    return (
      matched && {
        project: matched[1],
        issue: matched[0]
      }
    );
  }

  private async setCurrentWorkingProjectAndIssue(ticket: Ticket, issue: IIssue): Promise<void> {
    try {
      changeStateProject(ticket.project);
      vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', undefined, issue);
    } catch (e) {
      logger.printErrorMessageInOutputAndShowAlert(e);
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
