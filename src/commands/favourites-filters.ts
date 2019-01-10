import { SEARCH_MODE } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import { selectFavoriteFilters, selectIssue } from '../shared/select-utilities';

export default async function favouritesFiltersCommand(): Promise<void> {
  try {
    const filter = await selectFavoriteFilters();
    if (filter) {
      selectIssue(SEARCH_MODE.FAVOURITES_FILTERS, [filter.name, filter.jql]);
    }
  } catch (err) {
    printErrorMessageInOutputAndShowAlert(err);
  }
}
