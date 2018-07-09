import * as vscode from 'vscode';
import { Assignee, Issue } from '../http/api.model';
import BackPick from '../picks/backPick';
import UnassignedAssigneePick from '../picks/unassignedAssigneePick';
import state, { canExecuteJiraAPI, verifyCurrentProject } from '../state/state';
import { getConfigurationByKey } from './configuration';
import { BACK_PICK_LABEL, CONFIG, SEARCH_MODE, UNASSIGNED } from './constants';
import { addStatusIcon, createLabel } from './utilities';

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

const createJQL = async (mode: string, project: string): Promise<string | undefined> => {
  switch (mode) {
    case SEARCH_MODE.ID: {
      const id = await selectID();
      if (!!id) {
        return `id = '${project}-${id}' ORDER BY updated DESC`;
      }
      return undefined;
    }
    case SEARCH_MODE.STATUS: {
      const status = await selectStatus();
      if (!!status) {
        return `project in (${project}) AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`;
      }
      return undefined;
    }
    case SEARCH_MODE.STATUS_ASSIGNEE: {
      const { status, assignee } = await selectStatusAndAssignee();
      if (!!status && !!assignee) {
        return `project in (${project}) AND status = '${status}' AND assignee = ${assignee !== UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`;
      }
      return undefined;
    }
    case SEARCH_MODE.SUMMARY: {
      const summary = await selectSummary();
      if (!!summary) {
        return `project in (${project}) AND summary ~ '${summary}' ORDER BY updated DESC`;
      }
      return undefined;
    }
  }
  return undefined;
};

export const selectIssue = async (mode: string): Promise<string | undefined> => {
  if (canExecuteJiraAPI()) {
    const project = getConfigurationByKey(CONFIG.WORKING_PROJECT);
    if (verifyCurrentProject(project)) {
      const jql = await createJQL(mode, project || '');
      if (!!jql) {
        const issues = await state.jira.search({ jql });
        const picks = (issues.issues || []).map((issue: Issue) => {
          return {
            pickValue: issue.key,
            label: createLabel(issue, mode),
            description: issue.fields.summary,
            detail: issue.fields.description
          };
        });
        if (picks.length > 0) {
          const selected = await vscode.window.showQuickPick(picks, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Select an issue'
          });
          return selected ? selected.pickValue : undefined;
        } else {
          vscode.window.showInformationMessage(`No issues found for ${project} project`);
        }
      } else {
        throw new Error(`Wrong parameter. No issues found for ${project} project.`);
      }
    } else {
      throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
    }
  }
  return undefined;
};

export const selectAssignee = async (back: boolean): Promise<string> => {
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
    picks.unshift(new BackPick());
    picks.push(new UnassignedAssigneePick());
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
    const { firstChoise, secondChoise } = await doubleSelection(selectStatus, selectAssignee);
    return { status: firstChoise, assignee: secondChoise };
  } else {
    throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
  }
};

export const selectIssueAndAssignee = async (): Promise<{ issueKey: string; assignee: string }> => {
  const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
  if (verifyCurrentProject(project)) {
    const { firstChoise, secondChoise } = await doubleSelection(async () => await selectIssue(SEARCH_MODE.ID), selectAssignee);
    return { issueKey: firstChoise, assignee: secondChoise };
  } else {
    throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
  }
};
