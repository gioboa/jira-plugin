import * as vscode from 'vscode';
import { createClient } from '../http/api';
import { Assignee, Issue, Jira, Project } from '../http/api.model';
import BackPick from '../picks/backPick';
import UnassignedAssigneePick from '../picks/unassignedAssigneePick';
import state, { canExecuteJiraAPI } from '../state/state';
import { getConfigurationByKey, getGlobalStateConfiguration } from './configuration';
import { BACK_PICK_LABEL, CONFIG, CREDENTIALS_SEPARATOR, SEARCH_MODE, UNASSIGNED } from './constants';

export const executeConnectionToJira = (): void => {
  if (getConfigurationByKey(CONFIG.BASE_URL)) {
    const connect = async () => {
      state.jira = (await connectToJira())!;
      state.statusBar.updateStatusBar('');
      state.statuses = await state.jira.getStatuses();
      state.projects = await state.jira.getProjects();
    };
    connect().catch(() => {
      vscode.window.showErrorMessage('Failed to connect to jira');
    });
  }
};

export const connectToJira = async (): Promise<Jira | undefined> => {
  const baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
  const [username, password] = getGlobalStateConfiguration().split(CREDENTIALS_SEPARATOR);
  if (!!baseUrl && !!username && !!password) {
    try {
      const client = createClient(baseUrl, username, password);
      const serverInfo = await client.serverInfo();
      if (serverInfo.versionNumbers[0] < 5) {
        vscode.window.showInformationMessage(`Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
        return;
      }
      state.channel.appendLine(`Connected to JIRA server at '${baseUrl}'`);
      return client;
    } catch (e) {
      state.channel.appendLine(`Failed to contact JIRA server using '${baseUrl}'. Please check url and credentials`);
      state.channel.appendLine(e.message);
    }
  }
  return undefined;
};

export const selectProject = async (): Promise<string> => {
  if (canExecuteJiraAPI()) {
    const picks = state.projects.map(project => ({
      label: project.key,
      description: project.name
    }));
    const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set working project`, matchOnDescription: true });
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

const createLabel = (issue: Issue, mode: string): string => {
  switch (mode) {
    case SEARCH_MODE.ID:
      return `${issue.key} (${issue.fields.status ? issue.fields.status.name : ''})`;
    case SEARCH_MODE.STATUS:
      return issue.key;
    case SEARCH_MODE.STATUS_ASSIGNEE:
      return issue.key;
    case SEARCH_MODE.SUMMARY:
      return `${issue.key} (${issue.fields.status ? issue.fields.status.name : ''})`;
  }
  return '';
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
            issue,
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
          return selected ? selected.label : undefined;
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
    return selected ? selected.label : '';
  } else {
    throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
  }
};

export const selectStatusAndAssignee = async (): Promise<{ status: string; assignee: string }> => {
  const project = getConfigurationByKey(CONFIG.WORKING_PROJECT) || '';
  if (verifyCurrentProject(project)) {
    let ok = false;
    let assignee = '';
    let status = '';
    while (ok === false) {
      status = await selectStatus();
      assignee = await selectAssignee(true);
      if (assignee !== BACK_PICK_LABEL) {
        ok = true;
      }
    }
    return { status, assignee };
  } else {
    throw new Error(`Working project not correct, please select one valid project. ("Set working project" command)`);
  }
};
