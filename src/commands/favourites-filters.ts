import { SEARCH_MODE } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import { selectFavoriteFilters, selectIssue } from '../shared/select-utilities';
import { Command } from './shared/command';

export class FavouritesFiltersCommand implements Command {
  public id = 'jira-plugin.favouritesFilters';

  public async run(): Promise<void> {
    try {
      const filter = await selectFavoriteFilters();
      if (filter) {
        selectIssue(SEARCH_MODE.FAVOURITES_FILTERS, [filter.name, filter.jql]);
      }
    } catch (err) {
      printErrorMessageInOutputAndShowAlert(err);
    }
  }

  dispose(): void {}
}
