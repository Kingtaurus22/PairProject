"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: "CustomerId",
      });

      Order.belongsToMany(models.Product, {
        through: models.OrderItem,
        foreignKey: "OrderId",
        otherKey: "ProductId",
      });
    }
  }
  Order.init({
    totalOngkir: {
      type: DataTypes.INTEGER,
      defaultValue: 5000,
    },
    totalAmount: DataTypes.INTEGER,
    status: DataTypes.STRING,
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        paymentMethodRequired(value) {
          if (this.status !== "Cart" && !value) {
            throw new Error(
              "Please select a payment method"
            );
          }
        },
      },
    },
    CustomerId: DataTypes.INTEGER,
    paidAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
