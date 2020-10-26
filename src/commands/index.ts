import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { gitIntegration, selectValues, utilities } from '../services';
import { SEARCH_MODE } from '../shared/constants';
import changeIssueAssignee from './change-issue-assignee';
import changeIssueStatus from './change-issue-status';
import createIssue from './create-issue';
import favouritesFilters from './favourites-filters';
import issueAddComment from './issue-add-comment';
import issueAddWorklog from './issue-add-worklog';
import openGitHubRepo from './open-github-repo';
import openIssue from './open-issue';
import setWorkingIssue from './set-working-issue';
import setWorkingProject from './set-working-project';
import setupCredentials from './setup-credentials';
import stopWorkingIssue from './stop-working-issue';
import toggleWorkingIssueTimer from './toggle-working-issue-timer';

const { registerCommand } = vscode.commands;

export default {
  /**
   * Registers all plugin related commands
   *
   * @returns {vscode.Disposable[]}
   */
  register(): vscode.Disposable[] {
    return [
      // initial setup
      registerCommand('jira-plugin.setupCredentials', setupCredentials),

      // working project / issue
      registerCommand('jira-plugin.setWorkingProject', setWorkingProject),
      registerCommand('jira-plugin.setWorkingIssue', setWorkingIssue),
      registerCommand('jira-plugin.stopWorkingIssue', stopWorkingIssue),
      registerCommand('jira-plugin.toggleWorkingIssueTimer', toggleWorkingIssueTimer),
      registerCommand('jira-plugin.insertWorkingIssueComment', utilities.insertWorkingIssueComment),
      registerCommand('jira-plugin.issueAddWorklog', issueAddWorklog),

      // explorer header
      registerCommand('jira-plugin.createIssue', createIssue),

      // explorer group by
      registerCommand('jira-plugin.changeExplorerGroupBy', selectValues.changeExplorerGroupBy),

      // explorer filters
      registerCommand('jira-plugin.refresh', () => selectValues.selectIssue(SEARCH_MODE.REFRESH)),
      registerCommand('jira-plugin.defaultIssues', () => selectValues.selectIssue(SEARCH_MODE.DEFAULT)),
      registerCommand('jira-plugin.allIssues', () => selectValues.selectIssue(SEARCH_MODE.ALL)),
      registerCommand('jira-plugin.currentSprint', () => selectValues.selectIssue(SEARCH_MODE.CURRENT_SPRINT)),
      registerCommand('jira-plugin.myIssuesByStatus', () => selectValues.selectIssue(SEARCH_MODE.MY_STATUS)),
      registerCommand('jira-plugin.issuesByStatusAssignee', () => selectValues.selectIssue(SEARCH_MODE.STATUS_ASSIGNEE)),
      registerCommand('jira-plugin.issuesByStatus', () => selectValues.selectIssue(SEARCH_MODE.STATUS)),
      registerCommand('jira-plugin.issueById', () => selectValues.selectIssue(SEARCH_MODE.ID)),
      registerCommand('jira-plugin.issuesBySummary', () => selectValues.selectIssue(SEARCH_MODE.SUMMARY)),
      registerCommand('jira-plugin.favouritesFilters', favouritesFilters),

      // explorer issue
      registerCommand('jira-plugin.changeIssueStatus', changeIssueStatus),
      registerCommand('jira-plugin.changeIssueAssignee', changeIssueAssignee),
      registerCommand('jira-plugin.issueAddComment', (issue: IssueItem) => issueAddComment(issue, false)),
      registerCommand('jira-plugin.issueAddInternalComment', (issue: IssueItem) => issueAddComment(issue, true)),
      registerCommand('jira-plugin.openIssue', openIssue),
      registerCommand('jira-plugin.copyIssueKeySummary', utilities.copyIssueKeySummary),
      registerCommand('jira-plugin.copyIssueRemoteUrl', utilities.copyIssueRemoteUrl),

      // auxilary commands
      registerCommand('jira-plugin.openGitHubRepo', openGitHubRepo),

      // git integration commands
      registerCommand('jira-plugin.checkoutGitBranch', gitIntegration.invokeCheckoutBranch),
    ];
  },
};
