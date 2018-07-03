import * as vscode from 'vscode';
import { Project } from './api';
import { STATUSES } from './constants';
import state from './state';

export const selectProject = async (): Promise<string> => {
  const projects: Project[] = await state.jira.getProjects();
  const picks = projects.map(project => ({
    label: project.key,
    description: project.name
  }));
  const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
  return selected ? selected.label : '';
};

export const selectStatus = async (): Promise<string> => {
  const picks = STATUSES.map(status => ({
    label: status,
    description: ''
  }));
  const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Set status`, matchOnDescription: true });
  return selected ? selected.label : '';
};
