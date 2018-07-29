// @flow
import { Share, Team, User, Subscription } from '../models';
import uuid from 'uuid';

let count = 0;

export async function buildShare(overrides: Object = {}) {
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({ teamId: overrides.teamId });
    overrides.userId = user.id;
  }

  return Share.create(overrides);
}

export function buildTeam(overrides: Object = {}) {
  count++;

  return Team.create({
    name: `Team ${count}`,
    slackId: uuid.v4(),
    ...overrides,
  });
}

export async function buildSubscription(overrides: Object = {}) {
  if (overrides.teamId) {
    overrides.seats = await User.count({ where: { teamId: overrides.teamId } });
  } else {
    const team = await buildTeam();
    overrides.teamId = team.id;
    overrides.seats = 1;
  }

  return Subscription.create(
    {
      plan: 'subscription-monthly',
      status: 'active',
      autoPurchaseSeats: true,
      ...overrides,
    },
    {
      stripeToken: 'fakestripetoken',
      userId: overrides.userId,
    }
  );
}

export async function buildUser(overrides: Object = {}) {
  count++;

  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }

  return User.create({
    email: `user${count}@example.com`,
    username: `user${count}`,
    name: `User ${count}`,
    service: 'slack',
    serviceId: uuid.v4(),
    createdAt: new Date('2018-01-01T00:00:00.000Z'),
    ...overrides,
  });
}
