// @flow
import { Subscription } from '../models';

async function present(ctx: Object, subscription?: Subscription) {
  if (!subscription) {
    return {
      status: 'active',
      plan: 'free',
      seats: 0,
    };
  }

  const { plan } = await subscription.getStripeSubscription();
  const periodAmount = plan.amount * subscription.seats;

  return {
    status: subscription.status,
    seats: subscription.seats,
    plan: subscription.plan,
    period: plan.interval,
    amount: plan.amount,
    periodAmount,
    formattedPeriodAmount: `$${(periodAmount / 100).toFixed(2)}`,
  };
}

export default present;
