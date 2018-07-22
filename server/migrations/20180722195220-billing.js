module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teams', 'billingEmail', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      teamId: {
        type: Sequelize.UUID,
        references: {
          model: 'teams',
        },
      },
      plan: {
        type: Sequelize.STRING
      },
      seats: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      autoPurchaseSeats: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      stripeCustomerId: {
        type: Sequelize.STRING
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscriptions');
    await queryInterface.removeColumn('teams', 'billingEmail');
  },
};

