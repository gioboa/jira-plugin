import { QuickPickItem } from 'vscode';
import { BACK_PICK_LABEL } from '../shared/constants';

export default class BackPick implements QuickPickItem {
  get label(): string {
    return BACK_PICK_LABEL;
  }

  get description(): string {
    return `Previous selection`;
  }
}
