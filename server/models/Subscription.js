// @flow
import Stripe from '../stripe';
import { DataTypes, sequelize } from '../sequelize';
import { Team, User } from '../models';

const Subscription = sequelize.define('subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plan: { type: DataTypes.STRING },
  seats: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING },
  stripeCustomerId: { type: DataTypes.STRING },
  stripeSubscriptionId: { type: DataTypes.STRING },
  autoPurchaseSeats: { type: DataTypes.BOOLEAN },
});

Subscription.associate = models => {
  Subscription.belongsTo(models.Team);
};

Subscription.prototype.getStripeSubscription = function() {
  return Stripe.subscriptions.retrieve(this.stripeSubscriptionId);
};

Subscription.prototype.cancel = async function() {
  const subscription = await Stripe.subscriptions.del(
    this.stripeSubscriptionId
  );

  return this.update({ status: subscription.status });
};

const createStripeRecords = async (model, options) => {
  if (!options.stripeToken) {
    throw new Error('Subscription cannot be created without a stripe token');
  }
  if (!options.userId) {
    throw new Error('Subscription cannot be created without a userId');
  }

  const team = await Team.findById(model.teamId);
  const user = await User.findById(options.userId);
  const customer = await Stripe.customers.create({
    description: team.name,
    source: options.stripeToken,
    metadata: {
      teamId: team.id,
      teamName: team.name,
      userId: user.id,
      userName: user.name,
    },
  });

  const subscription = await Stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        plan: model.plan,
        quantity: model.seats,
      },
    ],
  });

  model.stripeCustomerId = customer.id;
  model.stripeSubscriptionId = subscription.id;
  model.status = subscription.status;
};

const updateStripeRecords = async (model, options) => {
  if (!model.stripeSubscriptionId) {
    throw new Error("Can't update the subscription with no Stripe id");
  }

  const response = await Stripe.subscriptions.retrieve(
    model.stripeSubscriptionId
  );
  const subscription = response.items.data[0];

  if (subscription.quantity !== model.seats) {
    await Stripe.subscriptionItems.update(subscription.id, {
      quantity: model.seats,
    });
  }

  if (options.stripeToken) {
    await Stripe.subscriptions.update(subscription.id, {
      source: options.stripeToken,
    });
  }

  const { status } = await Stripe.subscriptions.retrieve(
    model.stripeSubscriptionId
  );
  model.status = status;
};

Subscription.beforeUpdate(updateStripeRecords);
Subscription.beforeCreate(createStripeRecords);

export default Subscription;
