"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  Profile.init(
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Fullname is required'
          },
          notEmpty: {
            msg: 'Fullname is required'
          }
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Phone Number is required'
          },
          notEmpty: {
            msg: 'Phone Number is required'
          }
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Address is required'
          },
          notEmpty: {
            msg: 'Address is required'
          }
        },
      },
      UserId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Profile",
    },
  );
  return Profile;
};
