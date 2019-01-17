import { selectValues } from '../services';
import { changeStateProject } from '../store/state';

export default async function setWorkingProjectCommand(): Promise<void> {
  changeStateProject(await selectValues.selectProject());
}
