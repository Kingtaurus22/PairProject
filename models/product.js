'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "CategoryId",
      });

      Product.belongsTo(models.User, {
        foreignKey: "SellerId",
      });

      Product.belongsToMany(models.Order, {
        through: models.OrderItem,
        foreignKey: "ProductId",
        otherKey: "OrderId",
      });
    }
  }
  Product.init({
    productName: DataTypes.STRING,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    imageURL: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,
    SellerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};