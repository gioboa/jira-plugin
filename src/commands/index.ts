import * as vscode from 'vscode';
import { SEARCH_MODE } from '../shared/constants';
import changeIssueAssigneeCommand from './change-issue-assignee';
import changeIssueStatusCommand from './change-issue-status';
import createIssueCommand from './create-issue';
import favouritesFiltersCommand from './favourites-filters';
import issueAddCommentCommand from './issue-add-comment';
import issueAddWorklogCommand from './issue-add-worklog';
import openGitHubRepoCommand from './open-github-repo';
import openIssueCommand from './open-issue';
import setWorkingIssueCommand from './set-working-issue';
import setWorkingProjectCommand from './set-working-project';
import setupCredentials from './setup-credentials';
import services from '../services';

const { registerCommand } = vscode.commands;
const issueSelector = (mode: string) => () => services.selectValues.selectIssue(mode);

export default {
  /**
   * Registers all plugin related commands
   *
   * @returns {vscode.Disposable[]}
   */
  register(): vscode.Disposable[] {
    return [
      // initial setup
      registerCommand('jira-plugin.setupCredentialsCommand', setupCredentials),

      // working project / issue
      registerCommand('jira-plugin.setWorkingProjectCommand', setWorkingProjectCommand),
      registerCommand('jira-plugin.setWorkingIssueCommand', setWorkingIssueCommand),
      registerCommand('jira-plugin.insertWorkingIssueComment', services.utilities.insertWorkingIssueComment),
      registerCommand('jira-plugin.issueAddWorklogCommand', issueAddWorklogCommand),

      // explorer header
      registerCommand('jira-plugin.createIssueCommand', createIssueCommand),

      // explorer filters
      registerCommand('jira-plugin.refresh', issueSelector(SEARCH_MODE.REFRESH)),
      registerCommand('jira-plugin.allIssuesCommand', issueSelector(SEARCH_MODE.ALL)),
      registerCommand('jira-plugin.currentSprintCommand', issueSelector(SEARCH_MODE.CURRENT_SPRINT)),
      registerCommand('jira-plugin.myIssuesByStatusCommand', issueSelector(SEARCH_MODE.MY_STATUS)),
      registerCommand('jira-plugin.issuesByStatusAssigneeCommand', issueSelector(SEARCH_MODE.STATUS_ASSIGNEE)),
      registerCommand('jira-plugin.issuesByStatusCommand', issueSelector(SEARCH_MODE.STATUS)),
      registerCommand('jira-plugin.issueByIdCommand', issueSelector(SEARCH_MODE.ID)),
      registerCommand('jira-plugin.issuesBySummaryCommand', issueSelector(SEARCH_MODE.SUMMARY)),
      registerCommand('jira-plugin.favouritesFilters', favouritesFiltersCommand),

      // explorer issue
      registerCommand('jira-plugin.changeIssueStatusCommand', changeIssueStatusCommand),
      registerCommand('jira-plugin.changeIssueAssigneeCommand', changeIssueAssigneeCommand),
      registerCommand('jira-plugin.issueAddCommentCommand', issueAddCommentCommand),
      registerCommand('jira-plugin.openIssueCommand', openIssueCommand),
      registerCommand('jira-plugin.copyJiraSummary', services.utilities.copyToClipboard),

      // auxilary commands
      registerCommand('jira-plugin.openGitHubRepoCommand', openGitHubRepoCommand)
    ];
  }
};
