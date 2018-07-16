import { QuickPickItem } from 'vscode';
import { UNASSIGNED } from '../shared/constants';

export default class UnassignedAssigneePick implements QuickPickItem {
  get label(): string {
    return UNASSIGNED;
  }

  get description(): string {
    return UNASSIGNED;
  }

  get pickValue(): string {
    return UNASSIGNED;
  }
}
