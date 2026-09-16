'use strict';
const {
  Model
} = require('sequelize');
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
    totalOngkir: DataTypes.INTEGER,
    totalAmount: DataTypes.INTEGER,
    status: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    CustomerId: DataTypes.INTEGER,
    paidAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};