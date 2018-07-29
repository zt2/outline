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

  return {
    status: subscription.status,
    seats: subscription.seats,
    plan: subscription.plan,
    unitAmount: plan.amount,
    periodAmount: plan.amount * subscription.seats,
  };
}

export default present;
