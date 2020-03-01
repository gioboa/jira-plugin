import { statusBar } from '../services';

export default async function toggleWorkingIssueTimer(): Promise<void> {
  statusBar.toggleWorkingIssueTimer();
}
