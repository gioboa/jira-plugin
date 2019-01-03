import * as vscode from 'vscode';
import state from '../state/state';

export const printErrorMessageInOutputAndShowAlert = (err: any) => {
  if (state.channel) {
    vscode.window.showErrorMessage(`Error: Check logs in Jira Plugin terminal output.`);
    state.channel.append(`Error: ${err}\n`);
  }
};

export const printErrorMessageInOutput = (err: any) => {
  if (state.channel) {
    state.channel.append(`Error: ${err}\n`);
  }
};

export const debugMode = () => {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document) {
    const text = editor.document.getText();
    if (text.indexOf('JIRA_PLUGIN_DEBUG_MODE') !== -1) {
      return true;
    }
  }
  return false;
};

export const jiraPluginDebugLog = (message: string, value: any) => {
  if (debugMode()) {
    if (state.channel) {
      state.channel.append(`${message}: ${value}\n`);
    }
  }
};
