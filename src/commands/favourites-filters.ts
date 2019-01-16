import { SEARCH_MODE } from '../shared/constants';
import services from '../services';

export default async function favouritesFiltersCommand(): Promise<void> {
  try {
    const filter = await services.selectValues.selectFavoriteFilters();
    if (filter) {
      services.selectValues.selectIssue(SEARCH_MODE.FAVOURITES_FILTERS, [filter.name, filter.jql]);
    }
  } catch (err) {
    services.logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
