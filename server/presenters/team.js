// @flow
import { Team, User } from '../models';

async function present(ctx: Object, team: Team) {
  ctx.cache.set(team.id, team);
  const userCount = await User.count({ where: { teamId: team.id } });

  return {
    id: team.id,
    name: team.name,
    avatarUrl:
      team.avatarUrl || (team.slackData ? team.slackData.image_88 : null),
    slackConnected: !!team.slackId,
    googleConnected: !!team.googleId,
    userCount: userCount,
    isSuspended: await team.isSuspended(userCount),
    isAtFreeLimit: await team.isAtFreeLimit(userCount),
  };
}

export default present;
