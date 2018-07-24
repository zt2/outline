// @flow
import * as React from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { StripeProvider } from 'react-stripe-elements';
import styled from 'styled-components';
import Flex from 'shared/components/Flex';

import Button from 'components/Button';
import SubscriptionStore from 'stores/SubscriptionStore';
import CenteredContent from 'components/CenteredContent';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import PageTitle from 'components/PageTitle';
import StripeForm from './components/StripeForm';

type Props = {
  subscription: SubscriptionStore,
};

@observer
class Billing extends React.Component<Props> {
  @observable stripe: ?Object = null;
  @observable plan: string;

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

  handleChangePlan = (plan: string) => {
    this.plan = plan;
  };

  render() {
    const { subscription } = this.props;

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
                  {subscription.data.userCount} active user{subscription.data
                    .userCount !== 1 && 's'}
                </strong>.
              </p>
              {subscription.data.plan === 'free' ? (
                <p>
                  This team is on Outline`s free plan. Once have more than{' '}
                  {process.env.FREE_USER_LIMIT} users, you`re asked to upgrade
                  to a paid plan.
                </p>
              ) : (
                <p>
                  Active plan: {subscription.data.planName}
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
                  <StripeForm onSuccess={subscription.create} />
                </div>
              )}

              {subscription.canChangePaymentMethod && (
                <div>
                  update billing method:
                  <StripeForm onSuccess={subscription.update} />
                </div>
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

const PlanContainer = styled(Flex)`
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.black : 'transparent')};
`;

export default inject('subscription')(Billing);
