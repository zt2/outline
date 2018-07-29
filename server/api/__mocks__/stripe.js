import uuid from 'uuid';

const sub = {
  id: uuid.v4(),
  status: 'active',
  plan: {
    amount: 100,
  },
};

const Stripe = () => {
  return {
    customers: {
      create: () => ({
        id: uuid.v4(),
      }),
    },
    subscriptions: {
      create: () => sub,
      retrieve: () => sub,
    },
  };
};

export default Stripe;
