const copyPaste = require('copy-paste');
import * as path from 'path';
import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { IProject } from '../http/api.model';
import { CONFIG, DEFAULT_WORKING_ISSUE_STATUS, LATER, NO, STATUS_ICONS, YES } from '../shared/constants';
import { IssueLinkProvider } from '../shared/document-link-provider';
import state from '../store/state';
import services from '.';

export class UtilitiesService {
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

  secondsToMinutes(sec: number): number {
    return Math.floor(sec / 60);
  }

  workingIssueStatuses(): string {
    let statusList = (services.configuration.getConfigurationByKey(CONFIG.WORKING_ISSUE_STATUSES) || DEFAULT_WORKING_ISSUE_STATUS)
      .split(',')
      .map((status: string) => status.trim())
      .filter((status: string) => state.statuses.some(stateStatus => stateStatus.name.toLowerCase() === status.toLowerCase()));
    return statusList && statusList.length > 0
      ? statusList.reduce((a: string, b: string) => (a === '' ? a + `'${b}'` : `${a},'${b}'`), '')
      : `'${DEFAULT_WORKING_ISSUE_STATUS}'`;
  }

  async checkCounter(): Promise<void> {
    const count = services.configuration.getGlobalCounter(state.context) || 0;
    if (count !== -1) {
      if (count % 20 === 0 && count > 0) {
        let action = await vscode.window.showInformationMessage(`Star Jira Plugin on GitHub?`, YES, LATER, NO);
        switch (action) {
          case NO: {
            services.configuration.setGlobalCounter(state.context, -1);
            break;
          }
          case YES: {
            vscode.commands.executeCommand('jira-plugin.openGitHubRepoCommand');
            services.configuration.setGlobalCounter(state.context, -1);
            break;
          }
          default:
            services.configuration.setGlobalCounter(state.context, count + 1);
        }
      } else {
        services.configuration.setGlobalCounter(state.context, count + 1);
      }
    }
  }

  copyToClipboard(issue: IssueItem) {
    if (issue) {
      copyPaste.copy(issue.label);
      vscode.window.showInformationMessage('Jira Plugin - Copied to clipboard');
    } else {
      services.logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
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
    state.documentLinkDisposable = vscode.languages.registerDocumentLinkProvider('*', new IssueLinkProvider(projects));
  }
}
