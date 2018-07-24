// @flow
import Router from 'koa-router';
import auth from '../middlewares/authentication';
import { InvalidRequestError } from '../errors';
import { presentSubscription } from '../presenters';
import { Subscription } from '../models';
import policy from '../policies';
import type { Context } from 'koa';

const { authorize } = policy;
const router = new Router();

/**
 * Subscription middleware
 *
 * - Only limit to hosted installations
 * - Creates Stripe customers for teams
 */

function subscriptionMiddleware() {
  return async function subscriptionMiddleware(
    ctx: Context,
    next: () => Promise<*>
  ) {
    if (!process.env.BILLING_ENABLED) {
      throw new InvalidRequestError(
        'Endpoint not available when billing is disabled'
      );
    }
    return next();
  };
}

router.use(auth());
router.use(subscriptionMiddleware());

router.post('subscription.create', async ctx => {
  const { plan, stripeToken, seats, autoPurchaseSeats } = ctx.body;
  ctx.assertPresent(plan, 'plan is required');
  ctx.assertPresent(seats, 'seats is required');
  ctx.assertPresent(stripeToken, 'stripeToken is required');
  ctx.assertValueInArray(
    plan,
    ['subscription-yearly', 'subscription-monthly', 'free'],
    'valid plan is required'
  );

  const user = ctx.state.user;
  const team = await user.getTeam();
  authorize(user, 'update', team);

  try {
    const subscription = await Subscription.create(
      {
        teamId: user.teamId,
        autoPurchaseSeats,
        seats,
        plan,
      },
      {
        userId: user.id,
        stripeToken,
      }
    );

    ctx.body = {
      data: await presentSubscription(ctx, subscription),
    };
  } catch (err) {
    throw new InvalidRequestError(err.message);
  }
});

router.post('subscription.info', async ctx => {
  const user = ctx.state.user;
  const subscription = await Subscription.find({
    where: { teamId: user.teamId },
  });
  authorize(user, 'read', subscription);

  ctx.body = {
    data: await presentSubscription(ctx, subscription),
  };
});

router.post('subscription.cancel', async ctx => {
  const user = ctx.state.user;
  const subscription = await Subscription.find({
    where: { teamId: user.teamId },
  });
  authorize(user, 'cancel', subscription);
  await subscription.cancel();

  ctx.body = {
    data: await presentSubscription(ctx, subscription),
  };
});

router.post('subscription.update', async ctx => {
  const { plan, stripeToken, seats, autoPurchaseSeats } = ctx.body;
  const user = ctx.state.user;
  const subscription = await Subscription.find({
    where: { teamId: user.teamId },
  });
  authorize(user, 'update', subscription);
  await subscription.update(
    {
      autoPurchaseSeats,
      plan,
      seats,
    },
    {
      stripeToken,
    }
  );

  ctx.body = {
    data: await presentSubscription(ctx, subscription),
  };
});

export default router;
