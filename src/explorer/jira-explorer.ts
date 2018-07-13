import * as vscode from 'vscode';
import { IssueItem } from './jira-explorer.model';

export class JiraExplorer implements vscode.TreeDataProvider<IssueItem> {

	constructor() {}

	refresh(): void {
		console.log('refresh');
	}

	getTreeItem(element: IssueItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: IssueItem): IssueItem[] {
		return [new IssueItem('ciao', '0.1.0', vscode.TreeItemCollapsibleState.None, {
			command: 'extension.openPackageOnNpm',
			title: '',
			arguments: ['ciao']
		})
		];		
	}
}

