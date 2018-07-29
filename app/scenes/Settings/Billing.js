// @flow
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { StripeProvider } from 'react-stripe-elements';
import styled from 'styled-components';

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
      plan: this.plan,
      seats: this.seats,
      stripeToken,
    });
  };

  handleUpdate = (stripeToken: string) => {
    this.props.subscription.create({
      plan: this.plan,
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
                <Link to="/settings/people">
                  <strong>
                    {auth.team.userCount} active user{auth.team.userCount !==
                      1 && 's'}
                  </strong>
                </Link>
                .
              </p>
              <p>
                You are paying for <strong>{subscription.data.seats}</strong>{' '}
                seat{subscription.data.seats !== 1 && 's'} at a cost of{' '}
                {subscription.data.formattedPeriodAmount} per{' '}
                {subscription.data.period}
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
                    {subscription.plans.map(plan => (
                      <Plan
                        {...plan}
                        selected={this.plan === plan.id}
                        onSelect={this.handleChangePlan}
                      />
                    ))}
                  </div>
                  <Input
                    type="number"
                    min={auth.team.userCount}
                    onChange={this.handleChangeSeats}
                    defaultValue={
                      subscription.data.seats || auth.team.userCount
                    }
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
  id: string,
  name: string,
  selected: boolean,
  onSelect: string => *,
}) => {
  if (props.id === 'free') return null;

  return (
    <PlanContainer
      key={props.id}
      onClick={() => props.onSelect(props.id)}
      selected={props.selected}
    >
      {props.name}
    </PlanContainer>
  );
};

const PlanContainer = styled.a`
  padding: 10px;
  margin: 10px;
  background: ${({ selected, theme }) =>
    selected ? theme.slate : 'transparent'};
  color: ${({ selected, theme }) => (selected ? theme.white : 'inherit')};
`;

export default inject('subscription', 'auth')(Billing);
