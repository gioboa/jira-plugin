import * as vscode from 'vscode';
import { IAssignee, IIssue } from '../http/api.model';
import BackPick from '../picks/back-pick';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import UnassignedAssigneePick from '../picks/unassigned-assignee-pick';
import state, { canExecuteJiraAPI, changeStateIssues, printErrorMessageInOutput, verifyCurrentProject } from '../state/state';
import { getConfigurationByKey } from './configuration';
import { BACK_PICK_LABEL, CONFIG, LOADING, MAX_RESULTS, NO_WORKING_ISSUE, SEARCH_MODE, UNASSIGNED } from './constants';
import { addStatusIcon, checkCounter, workingIssueStatuses } from './utilities';

// selection for projects
export const selectProject = async (): Promise<string> => {
  try {
    if (canExecuteJiraAPI()) {
      if (state.projects.length === 0) {
        state.projects = await state.jira.getProjects();
      }
      const picks = state.projects.map(project => ({
        pickValue: project.key,
        label: project.key,
        description: project.name
      }));
      const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
      return selected ? selected.pickValue : '';
    }
  } catch (err) {
    printErrorMessageInOutput(err);
  }
  return '';
};

// selection for statuses
const selectStatus = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.statuses.map(status => ({
      pickValue: status.name,
      label: addStatusIcon(status.name, true),
      description: status.description
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
    return selected ? selected.pickValue : '';
  }
  return '';
};

// input for id
const selectID = async (): Promise<string | undefined> => {
  const id = await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA ID (only the number)' });
  return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
};

// input for summary
const selectSummary = async (): Promise<string | undefined> => {
  return await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA Summary' });
};

// return the filter (used in filter-info-item) and the JQL
const getFilterAndJQL = async (mode: string, project: string): Promise<string[]> => {
  checkCounter();
  switch (mode) {
    case SEARCH_MODE.ALL: {
      return [`ALL ISSUES`, `project = ${project} ORDER BY updated DESC`];
    }
    case SEARCH_MODE.ID: {
      const id = await selectID();
      if (!!id) {
        return [`ID: ${id}`, `id = '${project}-${id}' ORDER BY updated DESC`];
      }
      break;
    }
    case SEARCH_MODE.STATUS: {
      const status = await selectStatus();
      if (!!status) {
        return [`STATUS: ${status}`, `project = ${project} AND status = '${status}' ORDER BY updated DESC`];
      }
      break;
    }
    case SEARCH_MODE.MY_STATUS: {
      const status = await selectStatus();
      if (!!status) {
        return [
          `STATUS: ${status} ASSIGNEE: you`,
          `project = ${project} AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`
        ];
      }
      break;
    }
    case SEARCH_MODE.STATUS_ASSIGNEE: {
      const { status, assignee } = await selectStatusAndAssignee();
      if (!!status && !!assignee) {
        return [
          `STATUS: ${status} ASSIGNEE: ${assignee}`,
          `project = ${project} AND status = '${status}' AND assignee = ${
            assignee !== UNASSIGNED ? `'${assignee}'` : `null`
          } ORDER BY updated DESC`
        ];
      }
      break;
    }
    case SEARCH_MODE.SUMMARY: {
      const summary = await selectSummary();
      if (!!summary) {
        return [`SUMMARY: ${summary}`, `project in (${project}) AND summary ~ '${summary}' ORDER BY updated DESC`];
      }
      break;
    }
    case SEARCH_MODE.REFRESH: {
      return [state.currentFilter, state.currentJQL];
    }
    case SEARCH_MODE.MY_WORKING_ISSUES: {
      const statuses = workingIssueStatuses();
      return [
        `STATUS: ${statuses}`,
        `project = ${project} AND status in (${statuses}) AND assignee in (currentUser()) ORDER BY updated DESC`
      ];
    }
    case SEARCH_MODE.CURRENT_SPRINT :{
      return [`ALL ISSUES`, `project = ${project} AND sprint in openSprints() and sprint not in futureSprints() ORDER BY updated DESC`];
    }
  }
  return ['', ''];
};

// perform the search calling Jira API
export const selectIssue = async (mode: string): Promise<void> => {
  try {
    if (canExecuteJiraAPI()) {
      const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
      if (verifyCurrentProject(project)) {
        const [filter, jql] = await getFilterAndJQL(mode, project || '');
        changeStateIssues(LOADING.text, '', []);
        if (!!jql) {
          // call Jira API with the generated JQL
          const issues = await state.jira.search({ jql, maxResults: MAX_RESULTS });
          if (!!issues && !!issues.issues && issues.issues.length > 0) {
            changeStateIssues(filter, jql, issues.issues);
          } else {
            changeStateIssues(filter, jql, []);
            vscode.window.showInformationMessage(`No issues found for ${project} project`);
          }
        } else {
          changeStateIssues('', '', []);
          throw new Error(`Wrong parameter. No issues found for ${project} project.`);
        }
      } else {
        changeStateIssues('', '', []);
        throw new Error(`Working project not correct. Select working project in the status bar.`);
      }
    } else {
      changeStateIssues('', '', []);
    }
  } catch (e) {
    changeStateIssues('', '', []);
    printErrorMessageInOutput(e);
  }
};

// return working issues array
export const selectWorkingIssues = async (): Promise<IIssue[]> => {
  let issues: IIssue[] = [];
  try {
    if (canExecuteJiraAPI()) {
      const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
      if (verifyCurrentProject(project)) {
        const [filter, jql] = await getFilterAndJQL(SEARCH_MODE.MY_WORKING_ISSUES, project || '');
        if (!!jql) {
          const result = await state.jira.search({ jql, maxResults: MAX_RESULTS });
          issues = result.issues || [];
        }
      }
    }
  } catch (err) {
    printErrorMessageInOutput(err);
  }
  return issues;
};

// selection for working issues
export const selectChangeWorkingIssue = async (): Promise<IIssue | undefined> => {
  try {
    if (canExecuteJiraAPI()) {
      const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
      if (verifyCurrentProject(project)) {
        const [filter, jql] = await getFilterAndJQL(SEARCH_MODE.MY_WORKING_ISSUES, project || '');
        if (!!jql) {
          // call Jira API
          const issues = await state.jira.search({ jql, maxResults: MAX_RESULTS });
          if (issues.issues && issues.issues.length > 0) {
            const picks = issues.issues.map(issue => ({
              pickValue: issue,
              label: addStatusIcon(issue.fields.status.name, false) + ` ${issue.key}`,
              description: issue.fields.summary
            }));
            picks.unshift(new NoWorkingIssuePick());
            const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Your working issue list`, matchOnDescription: true });
            return selected ? selected.pickValue : undefined;
          } else {
            vscode.window.showInformationMessage(`No ${filter} issues found for your user in ${project} project`);
            // limit case, there is a working issue selected but the user has no more ${filter} issue. i.e: change of status of the working issue
            if (state.workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
              const picks = [new NoWorkingIssuePick()];
              const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Your working issue list`, matchOnDescription: true });
              return selected ? selected.pickValue : undefined;
            }
          }
        }
      }
    }
  } catch (err) {
    printErrorMessageInOutput(err);
  }
  return undefined;
};

// selection for assignees
export const selectAssignee = async (unassigned: boolean, back: boolean): Promise<string> => {
  try {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
    if (verifyCurrentProject(project)) {
      const assignees = await state.jira.getAssignees({ project, maxResults: MAX_RESULTS });
      const picks = (assignees || []).filter((assignee: IAssignee) => assignee.active === true).map((assignee: IAssignee) => {
        return {
          pickValue: assignee.key,
          label: assignee.key,
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
        placeHolder: 'Select an issue'
      });
      return selected ? selected.pickValue : '';
    } else {
      throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
  } catch (err) {
    printErrorMessageInOutput(err);
  }
  return '';
};

// only the possible transitions
export const selectTransition = async (issueKey: string): Promise<string | null | undefined> => {
  try {
    const transitions = await state.jira.getTransitions(issueKey);
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
    printErrorMessageInOutput(err);
  }
  return undefined;
};

const doubleSelection = async (
  firstSelection: Function,
  secondSelection: Function
): Promise<{ firstChoise: string; secondChoise: string }> => {
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
};

export const selectStatusAndAssignee = async (): Promise<{ status: string; assignee: string }> => {
  const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
  if (verifyCurrentProject(project)) {
    const { firstChoise, secondChoise } = await doubleSelection(selectStatus, async () => await selectAssignee(true, true));
    return { status: firstChoise, assignee: secondChoise };
  } else {
    throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
  }
};
