import * as vscode from 'vscode';
import { configuration, issuesExplorer, logger, store, utilities } from '.';
import BackPick from '../picks/back-pick';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import UnassignedAssigneePick from '../picks/unassigned-assignee-pick';
import {
  BACK_PICK_LABEL,
  CONFIG,
  GROUP_BY_FIELDS,
  LOADING,
  NO_WORKING_ISSUE,
  SEARCH_MAX_RESULTS,
  SEARCH_MODE,
  UNASSIGNED
} from '../shared/constants';
import { IAssignee, IFavouriteFilter, IIssue, IIssueType } from './http.model';

export default class SelectValuesService {
  private intervalInstance: NodeJS.Timer | undefined;

  // selection for projects
  public async selectProject(): Promise<string> {
    try {
      if (store.canExecuteJiraAPI()) {
        if (store.state.projects.length === 0) {
          store.state.projects = utilities.hideProjects(utilities.projectsToShow(await store.state.jira.getProjects()));
          utilities.createDocumentLinkProvider(store.state.projects);
        }
        const picks = store.state.projects.map(project => ({
          pickValue: project.key,
          label: project.key,
          description: project.name
        }));
        const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
        return selected ? selected.pickValue : '';
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return '';
  }

  // selection for statuses
  public async selectStatus(): Promise<string> {
    if (store.canExecuteJiraAPI()) {
      const picks = store.state.statuses.map(status => ({
        pickValue: status.name,
        label: utilities.addStatusIcon(status.name, true),
        description: status.description
      }));
      const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
      return selected ? selected.pickValue : '';
    }
    return '';
  }

  // input for id
  public async selectID(): Promise<string | undefined> {
    const id = await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert Jira ID (only the number)' });
    return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
  }

  // input for summary
  public async selectSummary(): Promise<string | undefined> {
    return await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert Jira Summary' });
  }

  // return the filter (used in filter-info-item) and the JQL
  public async getFilterAndJQL(mode: string, project: string): Promise<string[]> {
    utilities.checkCounter();
    if (mode === SEARCH_MODE.DEFAULT && !configuration.get(CONFIG.DEFAULT_JQL_SEARCH)) {
      mode = SEARCH_MODE.ALL;
    }
    switch (mode) {
      case SEARCH_MODE.DEFAULT: {
        return [
          `DEFAULT`,
          configuration
            .get(CONFIG.DEFAULT_JQL_SEARCH)
            .toString()
            .replace(/WORKING_PROJECT/g, project)
        ];
      }
      case SEARCH_MODE.ALL: {
        return [`ALL ISSUES`, `project = '${project}' ORDER BY status ASC, updated DESC`];
      }
      case SEARCH_MODE.ID: {
        const id = await this.selectID();
        if (!!id) {
          return [`ID: ${id}`, `id = '${project}-${id}' ORDER BY status ASC, updated DESC`];
        }
        break;
      }
      case SEARCH_MODE.STATUS: {
        const status = await this.selectStatus();
        if (!!status) {
          return [`STATUS: ${status}`, `project = '${project}' AND status = '${status}' ORDER BY status ASC, updated DESC`];
        }
        break;
      }
      case SEARCH_MODE.MY_STATUS: {
        const status = await this.selectStatus();
        if (!!status) {
          return [
            `STATUS: ${status} ASSIGNEE: you`,
            `project = '${project}' AND status = '${status}' AND assignee in (currentUser()) ORDER BY status ASC, updated DESC`
          ];
        }
        break;
      }
      case SEARCH_MODE.STATUS_ASSIGNEE: {
        const { status, assignee } = await this.selectStatusAndAssignee();
        if (!!status && !!assignee) {
          return [
            `STATUS: ${status} ASSIGNEE: ${assignee}`,
            `project = '${project}' AND status = '${status}' AND assignee = ${
              assignee !== UNASSIGNED ? `'${assignee}'` : `null`
            } ORDER BY status ASC, updated DESC`
          ];
        }
        break;
      }
      case SEARCH_MODE.SUMMARY: {
        const summary = await this.selectSummary();
        if (!!summary) {
          return [`SUMMARY: ${summary}`, `project = '${project}' AND summary ~ '${summary}' ORDER BY status ASC, updated DESC`];
        }
        break;
      }
      case SEARCH_MODE.REFRESH:
      case SEARCH_MODE.AUTO_REFRESH: {
        return [store.state.currentSearch.filter, store.state.currentSearch.jql];
      }
      case SEARCH_MODE.WORKING_ISSUES: {
        const statuses = configuration.workingIssueStatuses();
        const assignees = configuration.workingIssueAssignees();
        return [
          `STATUS: ${statuses}, ASSIGNEES: ${assignees}`,
          `project = '${project}' AND status in (${statuses}) AND assignee in (${assignees}) ORDER BY status ASC, updated DESC`
        ];
      }
      case SEARCH_MODE.CURRENT_SPRINT: {
        return [
          `CURRENT SPRINT`,
          `project = '${project}' AND sprint in openSprints() and sprint not in futureSprints() ORDER BY status ASC, updated ASC`
        ];
      }
    }
    return ['', ''];
  }

  private get autoRefreshValue(): number {
    const value = configuration.get(CONFIG.ISSUE_LIST_AUTO_REFRESH_INTERVAL);
    return !isNaN(parseInt(value)) ? value : 0;
  }

  private get isAutoRefreshEnabled(): boolean {
    return this.autoRefreshValue !== 0;
  }

  private stopTimeout(): void {
    if (this.intervalInstance) {
      clearInterval(this.intervalInstance);
    }
  }

  private startTimeout(): void {
    this.stopTimeout();
    this.intervalInstance = setTimeout(() => this.selectIssue(SEARCH_MODE.AUTO_REFRESH), this.autoRefreshValue * 1000 * 60);
  }

  // perform the search calling Jira API
  public async selectIssue(mode: string, filterAndJQL?: string[]): Promise<void> {
    try {
      this.stopTimeout();
      if (store.canExecuteJiraAPI()) {
        const project = configuration.get(CONFIG.WORKING_PROJECT);
        if (store.verifyCurrentProject(project)) {
          const [filter, jql] = filterAndJQL || (await this.getFilterAndJQL(mode, project));
          if (mode !== SEARCH_MODE.AUTO_REFRESH) {
            store.changeStateIssues(LOADING.text, '', []);
          }
          if (!!jql) {
            logger.jiraPluginDebugLog(`${filter} jql`, jql);
            // call Jira API with the generated JQL
            const maxResults = Math.min(configuration.get(CONFIG.NUMBER_ISSUES_IN_LIST), SEARCH_MAX_RESULTS);
            const searchResult = await store.state.jira.search({
              jql,
              maxResults
            });
            logger.jiraPluginDebugLog(`issues`, JSON.stringify(searchResult));
            if (this.isAutoRefreshEnabled) {
              this.startTimeout();
            }
            if (!!searchResult && !!searchResult.issues && searchResult.issues.length > 0) {
              // exclude issues with project key different from current working project
              searchResult.issues = searchResult.issues.filter((issue: IIssue) => (issue.fields.project.key || '') === project);
              store.changeStateIssues(filter, jql, searchResult.issues);
            } else {
              store.changeStateIssues(filter, jql, []);
              if (mode !== SEARCH_MODE.AUTO_REFRESH) {
                vscode.window.showInformationMessage(`No issues found for ${project} project`);
              }
            }
          } else {
            store.changeStateIssues('', '', []);
            throw new Error(`Wrong parameter. No issues found for ${project} project.`);
          }
        } else {
          store.changeStateIssues('', '', []);
          throw new Error(`Working project not correct. Select working project in the status bar.`);
        }
      } else {
        store.changeStateIssues('', '', []);
      }
    } catch (e) {
      store.changeStateIssues('', '', []);
      logger.printErrorMessageInOutputAndShowAlert(e);
    }
  }

  // return working issues array
  public async selectWorkingIssues(): Promise<IIssue[]> {
    let issues: IIssue[] = [];
    try {
      if (store.canExecuteJiraAPI()) {
        const project = configuration.get(CONFIG.WORKING_PROJECT);
        if (store.verifyCurrentProject(project)) {
          const [filter, jql] = await this.getFilterAndJQL(SEARCH_MODE.WORKING_ISSUES, project);
          if (!!jql) {
            const result = await store.state.jira.search({ jql, maxResults: SEARCH_MAX_RESULTS });
            issues = result.issues || [];
          }
        }
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return issues;
  }

  // selection for working issues
  public async selectChangeWorkingIssue(): Promise<IIssue | undefined> {
    try {
      if (store.canExecuteJiraAPI()) {
        const project = configuration.get(CONFIG.WORKING_PROJECT);
        const search_mode_filter = configuration.get(CONFIG.WORKING_ISSUE_SEARCH_KEY);
        if (store.verifyCurrentProject(project)) {
          const [filter, jql] = await this.getFilterAndJQL(search_mode_filter, project);
          vscode.window.setStatusBarMessage('Querying Jira for Issues', 3000);
          if (!!jql) {
            // call Jira API
            const issues = await store.state.jira.search({ jql, maxResults: SEARCH_MAX_RESULTS });
            if (issues.issues && issues.issues.length > 0) {
              const picks = issues.issues.map(issue => ({
                pickValue: issue,
                label: utilities.addStatusIcon(issue.fields.status.name, false) + ` ${issue.key}`,
                description: issue.fields.summary
              }));
              picks.unshift(new NoWorkingIssuePick());
              const selected = await vscode.window.showQuickPick(picks, {
                placeHolder: `Your working issue list`,
                matchOnDescription: true
              });
              return selected ? selected.pickValue : undefined;
            } else {
              vscode.window.showInformationMessage(`No ${filter} issues found in ${project} project`);
              // limit case, there is a working issue selected but the user has no more ${filter} issue. i.e: change of status of the working issue
              if (store.state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
                const picks = [new NoWorkingIssuePick()];
                const selected = await vscode.window.showQuickPick(picks, {
                  placeHolder: `Your working issue list`,
                  matchOnDescription: true
                });
                return selected ? selected.pickValue : undefined;
              }
            }
          }
        }
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return undefined;
  }

  // selection for assignees
  public async selectAssignee(
    unassigned: boolean,
    back: boolean,
    onlyKey: boolean,
    preLoadedPicks: IAssignee[] | undefined
  ): Promise<string | IAssignee> {
    try {
      const project = configuration.get(CONFIG.WORKING_PROJECT);
      if (store.verifyCurrentProject(project)) {
        const assignees = preLoadedPicks || (await store.state.jira.getAssignees(project));
        const picks = (assignees || [])
          .filter((assignee: IAssignee) => assignee.active === true)
          .map((assignee: IAssignee) => {
            return {
              pickValue: onlyKey ? assignee.key : assignee,
              label: assignee.key || assignee.displayName,
              description: assignee.displayName
            };
          });
        if (back) {
          picks.unshift(new BackPick());
        }
        if (unassigned) {
          picks.push(new UnassignedAssigneePick());
        }
        const selected = await vscode.window.showQuickPick(picks, {
          matchOnDescription: true,
          matchOnDetail: true,
          placeHolder: 'Select an assignee'
        });
        return selected ? selected.pickValue : '';
      } else {
        throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return '';
  }

  // only the possible transitions
  public async selectTransition(issueKey: string): Promise<string | null | undefined> {
    try {
      const transitions = await store.state.jira.getTransitions(issueKey);
      const picks = transitions.transitions.map(transition => ({
        pickValue: transition.id,
        label: transition.name,
        description: '',
        transition
      }));
      const selected = await vscode.window.showQuickPick(picks, {
        placeHolder: `Select transition to execute for ${issueKey}`,
        matchOnDescription: true
      });
      return selected ? selected.pickValue : undefined;
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return undefined;
  }

  public async doubleSelection(
    firstSelection: Function,
    secondSelection: Function
  ): Promise<{ firstChoise: string; secondChoise: string | IAssignee }> {
    let ok = false;
    let firstChoise = '';
    let secondChoise = '';
    while (ok === false) {
      firstChoise = await firstSelection();
      if (!!firstChoise) {
        secondChoise = await secondSelection(true);
      }
      if (!firstChoise || secondChoise !== BACK_PICK_LABEL) {
        ok = true;
      }
    }
    return { firstChoise, secondChoise };
  }

  public async selectStatusAndAssignee(): Promise<{ status: string; assignee: string }> {
    const project = configuration.get(CONFIG.WORKING_PROJECT);
    if (store.verifyCurrentProject(project)) {
      const { firstChoise, secondChoise } = await this.doubleSelection(
        this.selectStatus,
        async () => await this.selectAssignee(true, true, false, undefined)
      );
      return { status: firstChoise, assignee: (<IAssignee>secondChoise).name };
    } else {
      throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
  }

  public async selectIssueType(ignoreFocusOut: boolean, preLoadedPicks: IIssueType[]): Promise<IIssueType | undefined> {
    try {
      const types = preLoadedPicks || (await store.state.jira.getAllIssueTypes());
      const picks = (types || []).map(type => ({
        pickValue: type,
        label: type.name,
        description: '',
        type
      }));
      const selected = await vscode.window.showQuickPick(picks, {
        placeHolder: `Select type`,
        matchOnDescription: true,
        ignoreFocusOut
      });
      return selected ? selected.pickValue : undefined;
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return undefined;
  }

  // selection for Favorite Filters
  public async selectFavoriteFilters(): Promise<IFavouriteFilter | undefined> {
    try {
      if (store.canExecuteJiraAPI()) {
        const project = configuration.get(CONFIG.WORKING_PROJECT);
        if (store.verifyCurrentProject(project)) {
          const favFilters = await store.state.jira.getFavoriteFilters();
          if (favFilters && favFilters.length > 0) {
            const selected = await vscode.window.showQuickPick(
              favFilters.map(filter => {
                return {
                  label: filter.name,
                  description: filter.description,
                  pickValue: filter
                };
              }),
              {
                placeHolder: `Select favourite filter`,
                matchOnDescription: true
              }
            );
            return selected ? selected.pickValue : undefined;
          } else {
            vscode.window.showInformationMessage('No favourites filters found');
          }
        } else {
          throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
        }
      }
    } catch (err) {
      logger.printErrorMessageInOutputAndShowAlert(err);
    }
    return undefined;
  }

  public async changeExplorerGroupBy(): Promise<void> {
    const picks = [];
    picks.push({ ...GROUP_BY_FIELDS.STATUS });
    picks.push({ ...GROUP_BY_FIELDS.ASSIGNEE });
    picks.push({ ...GROUP_BY_FIELDS.TYPE });
    picks.push({ ...GROUP_BY_FIELDS.PRIORITY });
    picks.push({ ...GROUP_BY_FIELDS.UPDATED });
    const selected = await vscode.window.showQuickPick(picks, {
      placeHolder: `Select Group By field`,
      matchOnDescription: true
    });
    issuesExplorer.setGroupByField(selected || undefined);
    await vscode.commands.executeCommand('jira-plugin.refresh');
  }
}
