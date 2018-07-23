// @flow
import policy from './policy';
import { User, Subscription } from '../models';
import { AdminRequiredError } from '../errors';

const { allow } = policy;

allow(
  User,
  'read',
  Subscription,
  (actor, subscription) => actor.teamId === subscription.teamId
);

allow(
  User,
  ['create', 'cancel', 'update'],
  Subscription,
  (actor, subscription) => {
    if (!actor || actor.teamId !== subscription.teamId) return false;
    if (actor.isAdmin) return true;
    throw new AdminRequiredError();
  }
);
