import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { configuration, gitIntegration, logger, store } from '.';
import { ACTIONS, CONFIG } from '../shared/constants';
import { IIssue } from './http.model';

/**
 * TODO: overengineering. Implement simplier solution
 */
class BranchWatcher extends EventEmitter {
  private currentBranch: string | undefined;
  private interval: any;

  constructor() {
    super();
    this.startWatchingBranchChange();
  }

  /**
   * TODO: there should be a better way of observing changes
   */
  private startWatchingBranchChange(): void {
    this.interval = setInterval(async () => {
      const actualBranch = await gitIntegration.getHeadBranchName();
      if (actualBranch !== this.currentBranch) {
        this.emit(gitIntegration.EVENTS.BRANCH_CHANGED, actualBranch);
      }
      this.currentBranch = actualBranch || undefined;
    }, 1000); // FIXME: hardcoded value
  }

  public dispose(): any {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.removeAllListeners();
  }
}

export default class GitIntegrationService {
  public EVENTS = {
    BRANCH_CHANGED: 'branch:changed'
  };

  private enabled = false;
  private configWatcher: vscode.Disposable | undefined;
  private watcher: BranchWatcher | undefined;
  private gitExtension: vscode.Extension<any>;

  get isGitIntegrationEnabled(): boolean {
    return !!configuration.get(CONFIG.GIT_INTEGRATION_ENABLED);
  }

  constructor() {
    this.gitExtension = vscode.extensions.getExtension('vscode.git') || (undefined as any);
    vscode.commands.executeCommand('setContext', 'gitEnabled', '0');
    if (!!this.gitExtension) {
      this.configWatcher = vscode.workspace.onDidChangeConfiguration(() => this.toggleWatcher());
      this.toggleWatcher();
    }
  }

  public async getHeadBranchName(): Promise<string | void> {
    const [repo] = await this.getGitRepositories();
    if (repo) {
      vscode.commands.executeCommand('setContext', 'gitEnabled', '1');
    } else {
      vscode.commands.executeCommand('setContext', 'gitEnabled', '0');
    }
    const head = repo && repo.state && repo.state.HEAD;
    return head ? head.name : undefined;
  }

  public async getGitRepositories(): Promise<any> {
    const activated = await this.gitExtension.activate();
    const api = activated.getAPI(1);
    return api.repositories;
  }

  public async getAllGitRepositoriesRef(): Promise<any> {
    const enum RefType {
      Head,
      RemoteHead,
      Tag
    }
    const activated = await this.gitExtension.activate();
    const api = activated.getAPI(1);
    const [repo] = api.repositories;
    const repository = repo._repository;
    if (repo) {
      const config = vscode.workspace.getConfiguration('git');
      const checkoutType = config.get<string>('checkoutType') || 'all';
      const includeRemotes = checkoutType === 'all' || checkoutType === 'remote';
      const heads = repository.refs.filter((ref: any) => ref.type === RefType.Head);
      const remoteHeads = includeRemotes ? repository.refs.filter((ref: any) => ref.type === RefType.RemoteHead) : [];
      // const includeTags = checkoutType === 'all' || checkoutType === 'tags';
      // const tags = includeTags ? repository.refs.filter((ref: any) => ref.type === RefType.Tag) : [];
      return [...heads, ...remoteHeads];
    }
    return [];
  }

  private toggleWatcher(enabled = this.isGitIntegrationEnabled): void {
    if (enabled !== this.enabled) {
      enabled ? this.subscribeToWatcher() : this.disposeWatcher();
      this.enabled = enabled;
    }
  }

  private async onBranchChanged(newBranch: string): Promise<void> {
    if (!!newBranch) {
      const ticket = this.parseTicket(newBranch);
      if (ticket) {
        const issue = await store.state.jira.getIssueByKey(ticket.issue);
        // if issue exist and is different from current working issue
        const workingIssueKey = store.state.workingIssue.issue.key;
        if (!!issue && issue.key !== workingIssueKey) {
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

  private async onSwitchToWorkingTicketBranch(refs: any[]): Promise<string> {
    let newBranch;
    const action = await vscode.window.showInformationMessage(
      `Jira plugin detected that there is a git branch can be related to the working issue selected. ` +
        `Do you want change your git branch into ${refs.map((refs: any) => refs.name).join(' or ')}?`,
      ACTIONS.YES,
      ACTIONS.NO
    );
    if (action === ACTIONS.YES) {
      if (refs.length === 1) {
        newBranch = refs[0].name;
      } else {
        const selected = await vscode.window.showQuickPick<CheckoutItem>(refs.map((ref: any) => new CheckoutItem(ref)), {
          placeHolder: 'Select a branch'
        });
        newBranch = selected ? selected.label : undefined;
      }
    }
    return newBranch;
  }

  private parseTicket(branchName: string): { project: string; issue: string } | null {
    const matched = branchName.match(/([A-Z0-9]+)-(\d+)/);
    // read settings and map custom names here
    // project: matched[1].replace('MYPROJ', 'MYNEWPROJ'),
    // issue: matched[0].replace('MYPROJ', 'MYNEWPROJ')
    return (
      matched && {
        project: matched[1],
        issue: matched[0]
      }
    );
  }

  private async setCurrentWorkingProjectAndIssue(ticket: { project: string; issue: string }, issue: IIssue): Promise<void> {
    try {
      store.changeStateProject(ticket.project, false);
      vscode.commands.executeCommand('jira-plugin.setWorkingIssue', undefined, issue);
    } catch (e) {
      logger.printErrorMessageInOutputAndShowAlert(e);
    }
  }

  private subscribeToWatcher() {
    this.watcher = new BranchWatcher();
    this.watcher.on(this.EVENTS.BRANCH_CHANGED, this.onBranchChanged.bind(this));
  }

  private disposeWatcher() {
    return this.watcher && this.watcher.dispose();
  }

  public dispose(): any {
    if (!!this.configWatcher) {
      this.configWatcher.dispose();
    }
  }

  // plugin command

  public invokeCheckoutBranch() {
    vscode.commands.executeCommand('git.checkout');
  }

  public async switchToWorkingTicketBranch(issue: IIssue) {
    const [repo] = await this.getGitRepositories();
    const headBranchName = (await this.getHeadBranchName()) || '';
    if (
      !!issue &&
      this.gitExtension &&
      this.isGitIntegrationEnabled &&
      repo &&
      headBranchName.toUpperCase().indexOf(issue.key.toUpperCase()) === -1
    ) {
      const refs = (await this.getAllGitRepositoriesRef()).filter(
        (ref: any) => ref.name.toUpperCase().indexOf(issue.key.toUpperCase()) !== -1
      );
      if (!!refs && !!refs.length && refs.some((refs: any) => refs.name !== headBranchName)) {
        const newBranch = await this.onSwitchToWorkingTicketBranch(refs);
        if (!!newBranch) {
          await repo.checkout(newBranch);
        }
      }
    }
  }
}

class CheckoutItem implements vscode.QuickPickItem {
  constructor(protected ref: any) {}

  protected get shortCommit(): string {
    return (this.ref.commit || '').substr(0, 8);
  }
  get label(): string {
    return this.ref.name || this.shortCommit;
  }
  get description(): string {
    return this.shortCommit;
  }
}
