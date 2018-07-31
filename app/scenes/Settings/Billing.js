// @flow
import * as React from 'react';
import { find } from 'lodash';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { StripeProvider } from 'react-stripe-elements';
import styled from 'styled-components';

import SubscriptionStore from 'stores/SubscriptionStore';
import AuthStore from 'stores/AuthStore';

import Flex from 'shared/components/Flex';
import Input, { LabelText } from 'components/Input';
import HelpText from 'components/HelpText';
import CenteredContent from 'components/CenteredContent';
import LoadingPlaceholder from 'components/LoadingPlaceholder';
import PageTitle from 'components/PageTitle';
import BillingForm from './components/BillingForm';

type Props = {
  auth: AuthStore,
  subscription: SubscriptionStore,
};

@observer
class Billing extends React.Component<Props> {
  @observable stripe: ?Object = null;
  @observable plan: string = 'subscription-yearly';
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

  get selectedPlan() {
    return find(this.props.subscription.plans, { id: this.plan });
  }

  get totalAmount() {
    const plan = this.selectedPlan;
    if (!plan) return 0;

    return (plan.amount / 100 * this.seats).toFixed(2);
  }

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

  renderSubscribe = () => {
    const { subscription, auth } = this.props;
    if (!auth || !auth.team) return;

    return (
      <BillingForm
        onSuccess={this.handleCreate}
        submitLabel="Subscribe"
        submitNote={
          <HelpText>
            You will be billed <strong>${this.totalAmount}</strong> now and on{' '}
            {this.selectedPlan.period === 'year' ? 'an annual' : 'a monthly'}{' '}
            basis until cancelled.
          </HelpText>
        }
      >
        <React.Fragment>
          <HelpText>
            Your team can use Outline for free upto{' '}
            {process.env.FREE_USER_LIMIT} team members. For teams larger than{' '}
            {process.env.FREE_USER_LIMIT} you will need to subscribe to a paid
            plan below to continue building your knowledge base.
          </HelpText>

          <LabelText>Plan</LabelText>
          {subscription.plans.map(plan => (
            <Plan
              {...plan}
              key={plan.id}
              selected={this.plan === plan.id}
              onSelect={this.handleChangePlan}
            />
          ))}

          <Flex>
            <Input
              type="number"
              size={3}
              min={auth.team.userCount}
              onChange={this.handleChangeSeats}
              defaultValue={auth.team.userCount}
              label="Seats"
              style={{ width: 60 }}
            />
            <Seats>
              There is currently{' '}
              <strong>
                {auth.team.userCount} active user{auth.team.userCount !== 1 &&
                  's'}
              </strong>{' '}
              on your team. You can purchase any amount of seats above this or
              suspend users in{' '}
              <Link to="/settings/people">people management</Link> to reduce
              billing cost.
            </Seats>
          </Flex>
        </React.Fragment>
      </BillingForm>
    );
  };

  renderDetails = () => {
    const { subscription, auth } = this.props;
    if (!auth || !auth.team) return;

    return (
      <p>
        Your team is subscribed the {subscription.data.period} paid plan of
        Outline, you’re paying for <strong>{subscription.data.seats}</strong>{' '}
        seat{subscription.data.seats !== 1 && 's'} and currently have{' '}
        <Link to="/settings/people">
          {auth.team.userCount} active user{auth.team.userCount !== 1 && 's'}
        </Link>{' '}
        at a cost of {subscription.data.formattedPeriodAmount} per{' '}
        {subscription.data.period}
        .
      </p>
    );
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
              {subscription.canStart
                ? this.renderSubscribe()
                : this.renderDetails()}
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
  formattedAmount: string,
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
      <h2>{props.name}</h2>
      {props.formattedAmount} / user
    </PlanContainer>
  );
};

const Seats = styled(HelpText)`
  flex-grow: 1;
  margin: 20px 0 16px 16px;
  align-self: flex-end;
`;

const PlanContainer = styled.a`
  padding: 12px 8px;
  display: inline-block;
  margin: 0 10px 30px 0;
  border-radius: 8px;
  min-width: 140px;
  text-align: center;
  background: ${({ selected, theme }) =>
    selected ? theme.text : theme.slateLight};
  color: ${({ selected, theme }) => (selected ? theme.white : 'inherit')};

  h2 {
    color: ${({ selected, theme }) => (selected ? theme.white : 'inherit')};
    margin-top: 0;
  }
`;

export default inject('subscription', 'auth')(Billing);
