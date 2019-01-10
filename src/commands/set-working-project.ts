import { selectProject } from '../shared/select-utilities';
import { changeStateProject } from '../state/state';

export default async function setWorkingProjectCommand(): Promise<void> {
  changeStateProject(await selectProject());
}
