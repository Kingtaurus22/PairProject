"use strict";
const { Model, Op } = require("sequelize");
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
    static getProducts(search, category, sort) {
      let order = [["createdAt", "DESC"]];

      if (sort === "price_asc") {
        order = [["price", "ASC"]];
      }

      if (sort === "price_desc") {
        order = [["price", "DESC"]];
      }

      return this.findAll({
        include: {
          model: this.sequelize.models.Category,
        },

        where: {
          ...(search
            ? {
                productName: {
                  [Op.iLike]: `%${search}%`,
                },
              }
            : {}),

          ...(category
            ? {
                CategoryId: category,
              }
            : {}),
        },

        order,
      });
    }
  }
  Product.init(
    {
      productName: DataTypes.STRING,
      price: DataTypes.INTEGER,
      stock: DataTypes.INTEGER,
      imageURL: DataTypes.STRING,
      CategoryId: DataTypes.INTEGER,
      SellerId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
    },
  );
  return Product;
};
