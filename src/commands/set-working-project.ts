import { selectValues, store } from '../services';

export default async function setWorkingProjectCommand(): Promise<void> {
  store.changeStateProject(await selectValues.selectProject());
}
