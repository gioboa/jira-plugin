import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { logger } from '.';
import { ACTIONS, CONFIG } from '../shared/constants';
import state, { changeStateProject } from '../store/state';
import ConfigurationService from './configuration.service';
import { IIssue } from './http.model';

/**
 * TODO: overengineering. Implement simplier solution
 */
class BranchWatcher extends EventEmitter {
  static EVENTS = {
    BRANCH_CHANED: 'branch:changed'
  };

  constructor(private gitExtension: vscode.Extension<any>) {
    super();
    this.startWatchingBranchChange();
  }

  private async getGitRepositories(): Promise<any> {
    const activated = await this.gitExtension.activate();
    const api = activated.getAPI(1);
    return api.repositories;
  }

  public async getHeadBranch(): Promise<string | void> {
    const [repo] = await this.getGitRepositories();
    if (repo) {
      vscode.commands.executeCommand('setContext', 'gitEnabled', '1');
    } else {
      vscode.commands.executeCommand('setContext', 'gitEnabled', '0');
    }
    const head = repo && repo.state && repo.state.HEAD;
    return head && head.name;
  }

  public dispose(): any {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.removeAllListeners();
  }

  private currentBranch: string | undefined;
  private interval: any;

  /**
   * TODO: there should be a better way of observing changes
   */
  private startWatchingBranchChange(): void {
    this.interval = setInterval(async () => {
      const actualBranch = await this.getHeadBranch();
      if (actualBranch !== this.currentBranch) {
        this.emit(BranchWatcher.EVENTS.BRANCH_CHANED, actualBranch, this.currentBranch);
      }
      this.currentBranch = actualBranch || undefined;
    }, 1000); // FIXME: hardcoded value
  }
}

export default class GitIntegrationService {
  private enabled = false;
  private configWatcher: vscode.Disposable;
  private watcher: BranchWatcher | undefined;
  private currentBranch: string | undefined;
  private gitExtension: vscode.Extension<any> | undefined;

  get isGitIntegrationEnabled(): boolean {
    return !!this.configuration.get(CONFIG.GIT_INTEGRATION_ENABLED);
  }

  constructor(private configuration: ConfigurationService) {
    this.gitExtension = vscode.extensions.getExtension('vscode.git');
    vscode.commands.executeCommand('setContext', 'gitEnabled', '0');
    this.configWatcher = vscode.workspace.onDidChangeConfiguration(() => this.toggleWatcher());
    this.toggleWatcher();
  }

  private toggleWatcher(enabled = this.isGitIntegrationEnabled): void {
    if (!!this.gitExtension) {
      if (enabled !== this.enabled) {
        enabled ? this.subscribeToWatcher() : this.disposeWatcher();
        this.enabled = enabled;
      }
    }
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

  private parseTicket(branchName: string): { project: string; issue: string } | null {
    const matched = branchName.match(/([A-Z0-9]+)-(\d+)/);
    return (
      matched && {
        project: matched[1],
        issue: matched[0]
      }
    );
  }

  private async setCurrentWorkingProjectAndIssue(ticket: { project: string; issue: string }, issue: IIssue): Promise<void> {
    try {
      changeStateProject(ticket.project);
      vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', undefined, issue);
    } catch (e) {
      logger.printErrorMessageInOutputAndShowAlert(e);
    }
  }

  private subscribeToWatcher() {
    if (!!this.gitExtension) {
      this.watcher = new BranchWatcher(this.gitExtension);
      this.watcher.on(BranchWatcher.EVENTS.BRANCH_CHANED, this.onBranchChanged.bind(this));
    }
  }

  private disposeWatcher() {
    return this.watcher && this.watcher.dispose();
  }

  public dispose(): any {
    this.configWatcher.dispose();
  }

  // plugin command
  public invokeCreateBranch() {
    vscode.commands.executeCommand('git.branch', 'abc');
  }
}
