import * as vscode from 'vscode';
import { Assignee, Issue, Project } from '../http/api.model';
import state, { canExecuteJiraAPI } from '../state/state';
import { getConfigurationByKey } from './configuration';
import { CONFIG } from './constants';

export const SEARCH_MODE = {
  ID: 'ID',
  STATUS: 'STATUS',
  STATUS_ASSIGNEE: 'STATUS_ASSIGNEE'
};

export const UNASSIGNED = 'Unassigned';

export const selectProject = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.projects.map(project => ({
      label: project.key,
      description: project.name
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
    return selected ? selected.label : '';
  }
  return '';
};

export const selectStatus = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.statuses.map(status => ({
      label: status.name,
      description: status.description
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
    return selected ? selected.label : '';
  }
  return '';
};

const verifyCurrentProject = (project: string | undefined): boolean => {
  return !!project && state.projects.filter((prj: Project) => prj.key === project).length > 0;
};

const selectID = async (): Promise<string | undefined> => {
  const id = await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Insert JIRA ID (only the number)' });
  return id && !isNaN(parseInt(id)) ? parseInt(id).toString() : undefined;
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
      const status = await selectStatus();
      const assignee = await selectAssignee();
      if (!!status && !!assignee) {
        return `project in (${project}) AND status = '${status}' AND assignee = ${assignee !== UNASSIGNED ? `'${assignee}'` : `null`} ORDER BY updated DESC`;
      }
      return undefined;
    }
  }
  return undefined;
};

export const selectIssue = async (mode: string): Promise<string | undefined> => {
  if (canExecuteJiraAPI()) {
    const project = getConfigurationByKey(CONFIG.CURRENT_PROJECT);
    if (verifyCurrentProject(project)) {
      const jql = await createJQL(mode, project || '');
      if (!!jql) {
        const issues = await state.jira.search({ jql });
        const picks = (issues.issues || []).map((issue: Issue) => {
          return {
            issue,
            label: issue.key,
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
          return selected ? selected.label : undefined;
        } else {
          vscode.window.showInformationMessage(`No issues found in this project: ${project}`);
        }
      } else {
        vscode.window.showInformationMessage(`No issues found. Wrong parameter`);
      }
    } else {
      vscode.window.showInformationMessage(`Current project not correct, please select one valid project`);
    }
  }
  return undefined;
};

export const selectAssignee = async (): Promise<string> => {
  const project = getConfigurationByKey(CONFIG.CURRENT_PROJECT) || '';
  if (verifyCurrentProject(project)) {
    const assignees = await state.jira.getAssignees(`search?project=${project}`);
    const picks = (assignees || []).filter((assignee: Assignee) => assignee.active === true).map((assignee: Assignee) => {
      return {
        label: assignee.key,
        description: assignee.displayName,
        detail: ''
      };
    });
    picks.push({
      label: UNASSIGNED,
      description: UNASSIGNED,
      detail: ''
    });
    const selected = await vscode.window.showQuickPick(picks, {
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: 'Select an issue'
    });
    return selected ? selected.label : '';
  } else {
    vscode.window.showInformationMessage(`Current project not correct, please select one valid project`);
  }
  return '';
};
