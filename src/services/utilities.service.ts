import * as path from 'path';
import * as vscode from 'vscode';
import { configuration, logger } from '.';
import { IssueItem } from '../explorer/item/issue-item';
import { ACTIONS, CONFIG, STATUS_ICONS } from '../shared/constants';
import { IssueLinkProvider } from '../shared/document-link-provider';
import state from '../store/state';
import { IProject } from './http.model';

export default class UtilitiesService {
  // generate icon + status
  addStatusIcon(status: string, withDescription: boolean): string {
    let icon = STATUS_ICONS.DEFAULT.icon;
    if (!!status) {
      Object.values(STATUS_ICONS).forEach(value => {
        if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
          icon = value.icon;
        }
      });
    }
    return `${icon}` + (withDescription ? `  ${status} ` : ``);
  }

  getIconsPath(fileName: string): string {
    return path.join(__filename, '..', '..', '..', '..', 'images', 'icons', fileName);
  }

  secondsToHHMMSS(sec: number): string {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - hours * 3600) / 60);
    let seconds = sec - hours * 3600 - minutes * 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  floorSecondsToMinutes(sec: number): number {
    return Math.floor(sec / 60);
  }

  async checkCounter(): Promise<void> {
    const count = configuration.getGlobalCounter() || 0;
    if (count !== -1) {
      if (count % 20 === 0 && count > 0) {
        let action = await vscode.window.showInformationMessage(`Star Jira Plugin on GitHub?`, ACTIONS.YES, ACTIONS.LATER, ACTIONS.NO);
        switch (action) {
          case ACTIONS.NO: {
            configuration.setGlobalCounter(-1);
            break;
          }
          case ACTIONS.YES: {
            vscode.commands.executeCommand('jira-plugin.openGitHubRepoCommand');
            configuration.setGlobalCounter(-1);
            break;
          }
          default:
            configuration.setGlobalCounter(count + 1);
        }
      } else {
        configuration.setGlobalCounter(count + 1);
      }
    }
  }

  copyToClipboard(issue: IssueItem) {
    if (issue) {
      vscode.env.clipboard.writeText(issue.label || '');
      vscode.window.showInformationMessage('Jira Plugin - Copied to clipboard');
    } else {
      logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
    }
  }

  insertWorkingIssueComment() {
    const editor = vscode.window.activeTextEditor;
    if (editor && state.workingIssue) {
      editor.edit(edit => {
        const workingIssue = state.workingIssue;
        edit.insert(editor.selection.active, `// ${workingIssue.issue.key} - ${workingIssue.issue.fields.summary}`);
      });
    } else {
      vscode.window.showInformationMessage('No working issue');
    }
  }

  createDocumentLinkProvider(projects: IProject[]) {
    if (!!state.documentLinkDisposable) {
      state.documentLinkDisposable.dispose();
    }
    state.documentLinkDisposable = vscode.languages.registerDocumentLinkProvider({ scheme: '*' }, new IssueLinkProvider(projects));
  }

  hideProjects(projects: IProject[]): IProject[] {
    let projectsToHide = configuration.get(CONFIG.PROJECTS_TO_HIDE);
    if (!!projectsToHide) {
      projectsToHide = projectsToHide.split(',').map((p: string) => p.trim());
      projects = projects.filter((project: IProject) => !projectsToHide.includes(project.key));
    }
    return projects;
  }
}
