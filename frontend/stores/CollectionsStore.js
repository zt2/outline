// @flow
import { observable, action, runInAction, ObservableArray } from 'mobx';
import ApiClient, { client } from 'utils/ApiClient';

import stores from 'stores';
import Collection from 'models/Collection';
import ErrorsStore from 'stores/ErrorsStore';

type Options = {
  teamId: string,
};

class CollectionsStore {
  @observable data: ObservableArray<Collection> = observable.array([]);
  @observable isLoaded: boolean = false;

  client: ApiClient;
  teamId: string;
  errors: ErrorsStore;

  /* Actions */

  @action fetch = async (): Promise<*> => {
    try {
      const res = await this.client.post('/collections.list', {
        id: this.teamId,
      });
      const { data } = res;
      runInAction('CollectionsStore#fetch', () => {
        this.data.replace(
          data.map(
            collection =>
              new Collection({
                ...collection,
                errors: this.errors,
              })
          )
        );
        this.isLoaded = true;
      });
    } catch (e) {
      this.errors.add('Failed to load collections');
    }
  };

  constructor(options: Options) {
    this.client = client;
    this.errors = stores.errors;
    this.teamId = options.teamId;
  }
}

export default CollectionsStore;
