import * as vscode from 'vscode';
import { Project } from './api';
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
