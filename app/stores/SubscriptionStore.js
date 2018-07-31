// @flow
import { observable, action, computed, runInAction } from 'mobx';
import invariant from 'invariant';
import { client } from 'utils/ApiClient';
import type { Subscription, Plan } from 'shared/types';
import AuthStore from './AuthStore';

type State = 'fetching' | 'subscribing' | 'canceling';

class SubscriptionStore {
  auth: AuthStore;
  @observable data: ?Subscription;
  @observable plans: Plan[];
  @observable state: ?State;

  @computed
  get isLoaded(): boolean {
    return !!this.data;
  }

  @computed
  get isFree(): boolean {
    return (
      !!this.data &&
      (this.data.plan === 'free' || this.data.status === 'canceled')
    );
  }

  @computed
  get canCancel(): boolean {
    return this.data ? this.data.status === 'active' : false;
  }

  @computed
  get canStart(): boolean {
    return this.data
      ? this.data.status === 'canceled' || this.data.plan === 'free'
      : false;
  }

  @computed
  get canChangePaymentMethod(): boolean {
    if (!this.data) return false;
    if (this.data.plan === 'free') return false;
    return this.data.status === 'active';
  }

  @action
  fetch = async () => {
    try {
      const res = await client.post('/subscription.info');
      invariant(res && res.data, 'Data should be available');
      const { data } = res;

      runInAction('fetch', () => {
        this.data = data.subscription;
        this.plans = data.plans;
      });
    } catch (e) {
      console.error('Something went wrong');
    }
  };

  @action
  create = async (params: {
    plan: string,
    seats: number,
    stripeToken: string,
  }) => {
    this.state = 'subscribing';

    try {
      const res = await client.post('/subscription.create', params);
      invariant(res && res.data, 'Data should be available');
      const { data } = res;

      runInAction('create', () => {
        this.data = data;
      });
    } catch (e) {
      console.error('Something went wrong');
    }
    this.state = null;
    this.auth.fetch();
  };

  @action
  cancel = async () => {
    this.state = 'canceling';

    try {
      const res = await client.post('/subscription.cancel');
      invariant(res && res.data, 'Data should be available');
      const { data } = res;

      runInAction('cancel', () => {
        this.data = data;
      });
    } catch (e) {
      console.error('Something went wrong');
    }
    this.state = null;
    this.auth.fetch();
  };

  @action
  update = async (params: {
    plan: string,
    seats: number,
    stripeToken: string,
  }) => {
    this.state = 'subscribing';

    try {
      const res = await client.post('/subscription.update', params);
      invariant(res && res.data, 'Data should be available');
      const { data } = res;

      runInAction('update', () => {
        this.data = data;
      });
    } catch (e) {
      console.error('Something went wrong');
    }
    this.state = null;
    this.auth.fetch();
  };

  constructor(options: { auth: AuthStore }) {
    this.auth = options.auth;
  }
}

export default SubscriptionStore;
