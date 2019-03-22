import { selectValues, store } from '../services';

export default async function setWorkingProject(): Promise<void> {
  store.changeStateProject(await selectValues.selectProject(), false);
}
