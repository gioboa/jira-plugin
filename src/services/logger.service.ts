import * as vscode from 'vscode';
import state from '../store/state';

export default class LoggerService {
  public printErrorMessageInOutputAndShowAlert(err: any) {
    if (state.channel) {
      vscode.window.showErrorMessage(`Error: Check logs in Jira Plugin terminal output.`);
      state.channel.append(`Error: ${err}\n`);
    }
  }

  public printErrorMessageInOutput(err: any) {
    if (state.channel) {
      state.channel.append(`Error: ${err}\n`);
    }
  }

  private debugMode() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document) {
      const text = editor.document.getText();
      if (text.indexOf('JIRA_PLUGIN_DEBUG_MODE') !== -1) {
        return true;
      }
    }
    return false;
  }

  public jiraPluginDebugLog(message: string, value: any) {
    if (this.debugMode()) {
      if (state.channel) {
        state.channel.append(`${message}: ${value}\n`);
      }
    }
  }
}
