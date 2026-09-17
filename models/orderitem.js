'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    get subTotal() {
      return this.priceAtPurchase * this.quantity
    }

    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, {
        foreignKey: "OrderId",
      });

      OrderItem.belongsTo(models.Product, {
        foreignKey: "ProductId",
      });
    }
  }
  OrderItem.init({
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Quantity must be at least 1",
        }
      }
    },
    priceAtPurchase: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    OrderId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};