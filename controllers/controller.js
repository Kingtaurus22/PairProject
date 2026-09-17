const {
  Product,
  Category,
  User,
  Order,
  OrderItem,
  Profile,
} = require("../models");
const bcrypt = require("bcryptjs");
const { formatRp } = require("../helpers/helper");

class Controller {
  // Auth
  static async getLogin(req, res) {
    try {
      const { message, errors } = req.query;
      res.render("login", { message, errors });
    } catch (error) {
      res.send(error);
    }
  }

  static async postLogin(req, res) {
    try {
      const { email, password } = req.body;

      let errors = [];

      if (!email) {
        errors.push("Email is required");
      }

      if (!password) {
        errors.push("Password is required");
      }

      if (errors.length > 0) {
        return res.redirect(`/login?errors=${errors}`);
      }

      let data = await User.findOne({
        where: {
          email,
        },
      });

      if (data) {
        const isValidPassword = bcrypt.compareSync(password, data.password);

        if (isValidPassword) {
          req.session.userId = data.id;
          req.session.role = data.role;

          return res.redirect("/");
        } else {
          return res.redirect("/login?message=Invalid password");
        }
      } else {
        return res.redirect("/login?message=Invalid email");
      }
    } catch (error) {
      res.send(error);
    }
  }

  static async getRegister(req, res) {
    try {
      const { errors } = req.query;
      res.render("register", { errors });
    } catch (error) {
      res.send(error);
    }
  }

  static async postRegister(req, res) {
    try {
      const { username, email, role, password } = req.body;

      await User.create({
        username,
        email,
        role,
        password,
      });

      res.redirect("/login");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map((el) => el.message);
        res.redirect(`/register?errors=${errors}`);
      } else {
        res.send(error);
      }
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy(function (err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect("/login");
        }
      });
    } catch (error) {
      res.send(error);
    }
  }

  static async home(req, res) {
    try {
      const { search, sort, category } = req.query;

      const products = await Product.getProducts(search, category, sort);

      const categories = await Category.findAll({
        order: [["categoryName", "ASC"]],
      });

      const user = await User.findByPk(req.session.userId);

      res.render("home", {
        title: "Vendra",
        products,
        categories,
        search,
        sort,
        category,
        username: user.username,
        formatRp,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.session.userId, {
        include: {
          model: Profile,
        },
      });

      res.render("profile", {
        title: "My Profile",
        user,
        profile: user.Profile,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async getEditProfile(req, res) {
    try {
      const { errors } = req.query;
      const user = await User.findByPk(req.session.userId, {
        include: {
          model: Profile,
        },
      });

      res.render("profile-edit", {
        title: "Edit Profile",
        user,
        profile: user.Profile,
        errors,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async postProfile(req, res) {
    try {
      const { fullName, phoneNumber, address } = req.body;

      const profile = await Profile.findOne({
        where: {
          UserId: req.session.userId,
        },
      });

      if (profile) {
        await Profile.update(
          {
            fullName,
            phoneNumber,
            address,
          },
          {
            where: {
              UserId: req.session.userId,
            },
          },
        );
      } else {
        await Profile.create({
          fullName,
          phoneNumber,
          address,
          UserId: req.session.userId,
        });
      }

      res.redirect("/profile");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map((el) => el.message);
        res.redirect(`/profile/edit?errors=${errors}`);
      } else {
        res.send(error);
      }
    }
  }

  static async productDetail(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.query;

      const product = await Product.findByPk(id, {
        include: [Category, User],
      });

      const user = await User.findByPk(req.session.userId);

      res.render("productDetail", {
        title: product.productName,
        product,
        formatRp,
        username: user.username,
        message,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async addToCart(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findByPk(productId);

      const customerId = req.session.userId;

      let order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      if (!order) {
        order = await Order.create({
          CustomerId: customerId,
          totalOngkir: 5000,
          totalAmount: 0,
          status: "Cart",
          paymentMethod: null,
        });
      }

      let orderItem = await OrderItem.findOne({
        where: {
          OrderId: order.id,
          ProductId: product.id,
        },
      });

      if (orderItem) {
        orderItem.quantity += 1;
        await orderItem.save();
      } else {
        await OrderItem.create({
          OrderId: order.id,
          ProductId: product.id,
          quantity: 1,
          priceAtPurchase: product.price,
        });
      }

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
      });

      order.totalAmount = orderItems.reduce((total, item) => {
        return total + item.priceAtPurchase * item.quantity;
      }, order.totalOngkir);

      await order.save();

      res.redirect(
        `/products/${product.id}?message=Product ${product.productName} berhasil ditambahkan ke cart`,
      );
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async cart(req, res) {
    try {
      const { errors, productId } = req.query;
      const customerId = req.session.userId;

      const user = await User.findByPk(customerId);

      const order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      if (!order) {
        return res.render("cart", {
          title: "Shopping Cart",
          order: null,
          orderItems: [],
          formatRp,
          errors,
          productId,
          username: user.username,
        });
      }

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
        include: {
          model: Product,
        },
        order: [["createdAt", "ASC"]],
      });

      if (orderItems.length === 0) {
        const user = await User.findByPk(customerId);

        return res.render("cart", {
          title: "Shopping Cart",
          order,
          orderItems: [],
          formatRp,
          errors,
          productId,
          username: user.username,
        });
      }

      res.render("cart", {
        title: "Shopping Cart",
        order,
        orderItems,
        formatRp,
        errors,
        productId,
        username: user.username,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async removeFromCart(req, res) {
    try {
      const { productId } = req.params;

      const customerId = req.session.userId;

      const order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      if (!order) {
        return res.send("Cart masih kosong");
      }

      const orderItem = await OrderItem.findOne({
        where: {
          OrderId: order.id,
          ProductId: productId,
        },
      });

      if (!orderItem) {
        return res.send("Product tidak ada di cart");
      }

      await orderItem.destroy();

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
      });

      order.totalAmount = orderItems.reduce((total, item) => {
        return total + item.priceAtPurchase * item.quantity;
      }, order.totalOngkir);

      await order.save();

      res.redirect("/cart");
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async updateCart(req, res) {
    const { productId } = req.params;
    try {
      const { quantity } = req.body;

      const customerId = req.session.userId;

      const order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      if (!order) {
        return res.send("Cart masih kosong");
      }

      const orderItem = await OrderItem.findOne({
        where: {
          OrderId: order.id,
          ProductId: productId,
        },
      });

      if (!orderItem) {
        return res.send("Product tidak ada di cart");
      }

      const product = await Product.findByPk(productId);

      if (quantity > product.stock) {
        return res.send("Quantity melebihi stock");
      }

      orderItem.quantity = quantity;

      await orderItem.save();

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
      });

      order.totalAmount = orderItems.reduce((total, item) => {
        return total + item.priceAtPurchase * item.quantity;
      }, order.totalOngkir);

      await order.save();

      res.redirect("/cart");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map((el) => el.message);
        res.redirect(`/cart?errors=${errors}&productId=${productId}`);
      } else {
        res.send(error);
      }
    }
  }

  static async checkout(req, res) {
    try {
      const { errors } = req.query;

      const customerId = req.session.userId;

      const user = await User.findByPk(customerId);

      const order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
        include: {
          model: Product,
        },
        order: [["createdAt", "ASC"]],
      });

      res.render("checkout", {
        title: "Checkout",
        order,
        orderItems,
        formatRp,
        errors,
        username: user.username,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async placeOrder(req, res) {
    try {
      const customerId = req.session.userId;

      const { paymentMethod } = req.body;

      const order = await Order.findOne({
        where: {
          CustomerId: customerId,
          status: "Cart",
        },
      });

      const orderItems = await OrderItem.findAll({
        where: {
          OrderId: order.id,
        },
        include: {
          model: Product,
        },
        order: [["createdAt", "ASC"]],
      });

      //   for (const item of orderItems) {
      //     if (item.quantity > item.Product.stock) {
      //       return res.send(`Stock ${item.Product.productName} tidak mencukupi`);
      //     }
      //   }

      for (const item of orderItems) {
        item.Product.stock -= item.quantity;

        await item.Product.save();
      }

      order.paymentMethod = paymentMethod;
      order.status = "Paid";

      await order.save();

      res.send("Order berhasil dibuat");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        let errors = error.errors.map((el) => el.message);
        res.redirect(`/checkout?errors=${errors}`);
      } else {
        res.send(error);
      }
    }
  }

  static async orders(req, res) {
    try {
      const customerId = req.session.userId;

      const orders = await Order.findAll({
        where: {
          CustomerId: customerId,
        },
        include: {
          model: Product,
          through: OrderItem,
        },
        order: [["createdAt", "DESC"]],
      });

      const user = await User.findByPk(customerId);

      res.render("orders", {
        title: "My Orders",
        orders,
        formatRp,
        username: user.username,
      });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }

  static async invoice(req, res) {
    try {
      const { default: easyinvoice } = await import("easyinvoice");

      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Product,
            through: OrderItem,
          },
          {
            model: User,
            include: {
              model: Profile,
              attributes: ["fullName", "address"],
              required: false,
            },
          },
        ],
      });

      const products = order.Products.map((product) => {
        return {
          quantity: product.OrderItem.quantity,
          description: product.productName,
          taxRate: 0,
          price: product.OrderItem.priceAtPurchase,
        };
      });

      const data = {
        sender: {
          company: "Vendra",
          address: "Jakarta",
          country: "Indonesia",
        },

        client: {
          company: order.User.Profile
            ? order.User.Profile.fullName
            : order.User.username,

          address: order.User.Profile
            ? order.User.Profile.address
            : "Alamat belum tersedia",
        },

        information: {
          number: `ORDER-${order.id}`,
          date: new Date().toLocaleDateString("id-ID"),
        },

        products,

        settings: {
          currency: "IDR",
          locale: "id-ID",
        },

        bottomNotice: "Thank you for shopping at Vendra.",
      };

      const result = await easyinvoice.createInvoice(data);

      res.redirect(result.pdfUrl);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
}

module.exports = Controller;
