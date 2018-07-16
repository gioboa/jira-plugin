import * as vscode from 'vscode';
import { Assignee, Issue } from '../http/api.model';
import BackPick from '../picks/back-pick';
import NoIssueLoggingPick from '../picks/no-log-issue-pick';
import UnassignedAssigneePick from '../picks/unassigned-assignee-pick';
import state, { canExecuteJiraAPI, changeIssuesInState, verifyCurrentProject } from '../state/state';
import { getConfigurationByKey } from './configuration';
import { BACK_PICK_LABEL, CONFIG, LOADING, SEARCH_MODE, UNASSIGNED } from './constants';
import { addStatusIcon } from './utilities';

export const selectProject = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.projects.map(project => ({
      pickValue: project.key,
      label: project.key,
      description: project.name
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
    return selected ? selected.pickValue : '';
  }
  return '';
};

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

const selectID = async (): Promise<string | undefined> => {
  const id = await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA ID (only the number)' });
  return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
};

const selectSummary = async (): Promise<string | undefined> => {
  return await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA Summary' });
};

const getFilterAndJQL = async (mode: string, project: string): Promise<string[]> => {
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
        return [`STATUS: ${status}`, `project = ${project} AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`];
      }
      break;
    }
    case SEARCH_MODE.STATUS_ASSIGNEE: {
      const { status, assignee } = await selectStatusAndAssignee();
      if (!!status && !!assignee) {
        return [`STATUS: ${status} ASSIGNEE ${assignee}`, `project = ${project} AND status = '${status}' AND assignee = ${assignee !== UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`];
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
    case SEARCH_MODE.MY_IN_PROGRESS_ISSUES: {
      return [`STATUS: In progress`, `project = ${project} AND status = 'In progress' AND assignee in (currentUser()) ORDER BY updated DESC`];
    }
  }
  return ['', ''];
};

export const selectIssue = async (mode: string): Promise<void> => {
  if (canExecuteJiraAPI()) {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
    if (verifyCurrentProject(project)) {
      const [filter, jql] = await getFilterAndJQL(mode, project || '');
      changeIssuesInState(LOADING.text, '', []);
      if (!!jql) {
        const issues = await state.jira.search({ jql });
        if (!!issues && !!issues.issues && issues.issues.length > 0) {
          changeIssuesInState(filter, jql, issues.issues);
        } else {
          changeIssuesInState(filter, jql, []);
          vscode.window.showInformationMessage(`No issues found for ${project} project`);
        }
      } else {
        changeIssuesInState('', '', []);
        throw new Error(`Wrong parameter. No issues found for ${project} project.`);
      }
    } else {
      changeIssuesInState('', '', []);
      throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
  } else {
    changeIssuesInState('', '', []);
  }
};

export const selectChangeIssueLogging = async (): Promise<Issue | undefined> => {
  if (canExecuteJiraAPI()) {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
    if (verifyCurrentProject(project)) {
      const [filter, jql] = await getFilterAndJQL(SEARCH_MODE.MY_IN_PROGRESS_ISSUES, project || '');
      if (!!jql) {
        const issues = await state.jira.search({ jql });
        if (issues.issues && issues.issues.length > 0) {
          const picks = issues.issues.map(issue => ({
            pickValue: issue,
            label: addStatusIcon(issue.fields.status.name, false) + ` ${issue.fields.summary}`,
            description: ''
          }));
          picks.unshift(new NoIssueLoggingPick());
          const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Select Issue`, matchOnDescription: true });
          return selected ? selected.pickValue : undefined;
        } else {
          vscode.window.showInformationMessage(`No 'In Progress' issues found for your user in ${project} project`);
        }
      }
    }
  }
  return undefined;
};

export const selectAssignee = async (unassigned: boolean, back: boolean): Promise<string> => {
  const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
  if (verifyCurrentProject(project)) {
    const assignees = await state.jira.getAssignees(`search?project=${project}`);
    const picks = (assignees || []).filter((assignee: Assignee) => assignee.active === true).map((assignee: Assignee) => {
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
};

export const selectTransition = async (issueKey: string): Promise<string | null | undefined> => {
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
};

const doubleSelection = async (firstSelection: Function, secondSelection: Function): Promise<{ firstChoise: string; secondChoise: string }> => {
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
