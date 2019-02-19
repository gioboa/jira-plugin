import { QuickPickItem } from 'vscode';
import { IIssue } from '../services/http.model';
import { NO_WORKING_ISSUE } from '../shared/constants';

export default class NoWorkingIssuePick implements QuickPickItem {
  get label(): string {
    return `$(x) ${NO_WORKING_ISSUE.text}`;
  }

  get description(): string {
    return '';
  }

  get pickValue(): IIssue {
    return {
      id: '',
      key: NO_WORKING_ISSUE.key,
      fields: {
        summary: '',
        status: {
          name: ''
        },
        project: {
          id: '',
          key: '',
          name: ''
        }
      }
    };
  }
}
