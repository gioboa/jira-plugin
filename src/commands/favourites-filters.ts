import { logger, selectValues } from '../services';
import { SEARCH_MODE } from '../shared/constants';

export default async function favouritesFiltersCommand(): Promise<void> {
  try {
    const filter = await selectValues.selectFavoriteFilters();
    if (filter) {
      selectValues.selectIssue(SEARCH_MODE.FAVOURITES_FILTERS, [filter.name, filter.jql]);
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
