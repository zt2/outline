// @flow
import createStripe from 'stripe';

const Stripe = createStripe(process.env.STRIPE_SECRET_KEY);
export default Stripe;
