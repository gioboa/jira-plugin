import * as vscode from 'vscode';
import { Project, Status } from './api';
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
  const statuses: Status[] = await state.jira.getStatuses();
  const picks = statuses.map(status => ({
    label: status.name,
    description: status.description
  }));
  const selected = await vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
  return selected ? selected.label : '';
};
