import { QuickPickItem } from 'vscode';
import { Issue } from '../http/api.model';
import { NO_ISSUE_LOGGING } from '../shared/constants';

export default class NoIssueLoggingPick implements QuickPickItem {
  get label(): string {
    return `$(x) ${NO_ISSUE_LOGGING.text}`;
  }

  get description(): string {
    return '';
  }

  get pickValue(): Issue {
    return {
      id: '',
      key: NO_ISSUE_LOGGING.key,
      fields: {
        summary: '',
        status: {
          name: ''
        }
      }
    };
  }
}
