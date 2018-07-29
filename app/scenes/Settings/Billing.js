// @flow
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { StripeProvider } from 'react-stripe-elements';
import styled from 'styled-components';
import Flex from 'shared/components/Flex';

import SubscriptionStore from 'stores/SubscriptionStore';
import AuthStore from 'stores/AuthStore';

import Button from 'components/Button';
import Input from 'components/Input';
import CenteredContent from 'components/CenteredContent';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import PageTitle from 'components/PageTitle';
import StripeForm from './components/StripeForm';

type Props = {
  auth: AuthStore,
  subscription: SubscriptionStore,
};

@observer
class Billing extends React.Component<Props> {
  @observable stripe: ?Object = null;
  @observable plan: string = 'yearly';
  @observable seats: number = 1;

  componentDidMount() {
    this.props.subscription.fetch();
    this.loadStripe();
  }

  loadStripe = () => {
    if (window.Stripe) {
      this.stripe = window.Stripe(process.env.STRIPE_PUBLIC_KEY);
    } else {
      const element = document.querySelector('#stripe-js');
      if (!element) return;

      element.addEventListener('load', () => {
        this.stripe = window.Stripe(process.env.STRIPE_PUBLIC_KEY);
      });
    }
  };

  handleCreate = (stripeToken: string) => {
    this.props.subscription.create({
      plan: `subscription-${this.plan}`,
      seats: this.seats,
      stripeToken,
    });
  };

  handleUpdate = (stripeToken: string) => {
    this.props.subscription.create({
      plan: `subscription-${this.plan}`,
      seats: this.seats,
      stripeToken,
    });
  };

  handleChangePlan = (plan: string) => {
    this.plan = plan;
  };

  handleChangeSeats = (ev: SyntheticInputEvent<>) => {
    this.seats = parseInt(ev.target.value, 10);
  };

  render() {
    const { subscription, auth } = this.props;
    if (!auth || !auth.team) return;

    return (
      <StripeProvider stripe={this.stripe}>
        <CenteredContent>
          <PageTitle title="Billing" />
          <h1>Billing</h1>

          {subscription.data ? (
            <React.Fragment>
              <p>
                Your team currently has{' '}
                <strong>
                  {auth.team.userCount} active user{auth.team.userCount !== 1 &&
                    's'}
                </strong>.
              </p>
              <p>
                You are paying for <strong>{subscription.data.seats}</strong>{' '}
                seat{subscription.data.seats !== 1 && 's'} at a cost of ${subscription
                  .data.periodAmount / 100}
                .
              </p>
              {subscription.data.plan === 'free' ? (
                <p>
                  This team is on Outline`s free plan. Once have more than{' '}
                  {process.env.FREE_USER_LIMIT} users, you`re asked to upgrade
                  to a paid plan.
                </p>
              ) : (
                <p>
                  Active plan: <strong>{subscription.data.plan}</strong>
                  <br />
                  Plan status: {subscription.data.status}
                  <br />
                  {subscription.canCancel && (
                    <Button onClick={subscription.cancel} light>
                      Cancel Subscription
                    </Button>
                  )}
                </p>
              )}

              {subscription.canStart && (
                <React.Fragment>
                  <div>
                    <Plan
                      type="yearly"
                      selected={this.plan === 'yearly'}
                      onSelect={this.handleChangePlan}
                    />
                    <Plan
                      type="monthly"
                      selected={this.plan === 'monthly'}
                      onSelect={this.handleChangePlan}
                    />
                  </div>
                  <Input
                    type="number"
                    onChange={this.handleChangeSeats}
                    defaultValue={auth.team.userCount}
                  />
                  <StripeForm onSuccess={this.handleCreate} />
                </React.Fragment>
              )}

              {subscription.canChangePaymentMethod && (
                <React.Fragment>
                  Update billing:
                  <StripeForm onSuccess={this.handleUpdate} />
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <LoadingPlaceholder />
          )}
        </CenteredContent>
      </StripeProvider>
    );
  }
}

const Plan = (props: {
  type: 'yearly' | 'monthly',
  selected: boolean,
  onSelect: ('yearly' | 'monthly') => void,
}) => {
  return (
    <PlanContainer
      onClick={() => props.onSelect(props.type)}
      selected={props.selected}
    >
      {props.type}
    </PlanContainer>
  );
};

const PlanContainer = styled.a`
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.black : 'transparent')};
`;

export default inject('subscription', 'auth')(Billing);
