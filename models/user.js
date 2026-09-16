'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Product, {
        foreignKey: "SellerId",
      });

      User.hasMany(models.Order, {
        foreignKey: "CustomerId",
      });

      User.hasOne(models.Profile, {
        foreignKey: "UserId",
      });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM("admin", "customer")
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};