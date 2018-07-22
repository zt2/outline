// @flow
import uuid from 'uuid';
import { DataTypes, sequelize, Op } from '../sequelize';
import { publicS3Endpoint, uploadToS3FromUrl } from '../utils/s3';
import Collection from './Collection';
import User from './User';
import { subscriptionsQueue } from '../jobs/subscriptions';

const Team = sequelize.define(
  'team',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    slackId: { type: DataTypes.STRING, allowNull: true },
    googleId: { type: DataTypes.STRING, allowNull: true },
    avatarUrl: { type: DataTypes.STRING, allowNull: true },
    slackData: DataTypes.JSONB,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['slackId'],
      },
    ],
    getterMethods: {
      isSuspended() {
        return (
          process.env.BILLING_ENABLED &&
          this.users.count() > process.env.FREE_USER_LIMIT &&
          this.subscription.status !== 'active'
        );
      },
      isAtFreeLimit() {
        return (
          process.env.BILLING_ENABLED &&
          this.users.count() === process.env.FREE_USER_LIMIT &&
          this.subscription.status !== 'active'
        );
      },
    },
  }
);

Team.associate = models => {
  Team.hasMany(models.Collection, { as: 'collections' });
  Team.hasMany(models.Document, { as: 'documents' });
  Team.hasMany(models.User, { as: 'users' });
};

const uploadAvatar = async model => {
  const endpoint = publicS3Endpoint();

  if (model.avatarUrl && !model.avatarUrl.startsWith(endpoint)) {
    try {
      const newUrl = await uploadToS3FromUrl(
        model.avatarUrl,
        `avatars/${model.id}/${uuid.v4()}`
      );
      if (newUrl) model.avatarUrl = newUrl;
    } catch (_err) {}
  }
};

Team.prototype.createFirstCollection = async function(userId) {
  return await Collection.create({
    name: 'General',
    description: 'Your first Collection',
    type: 'atlas',
    teamId: this.id,
    creatorId: userId,
  });
};

Team.beforeSave(uploadAvatar);

export default Team;
