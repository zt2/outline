// @flow
import { Subscription } from '../models';

async function present(ctx: Object, subscription?: Subscription) {
  if (!subscription) {
    return {
      plan: 'free',
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
