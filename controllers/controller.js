const {
    Product,
    Category,
    User,
    Order,
    OrderItem,
    Profile,
} = require("../models");
const { Op } = require("sequelize");
const bcrypt = require('bcryptjs');
const { formatRp } = require("../helpers/helper");
// const easyinvoice = require("easyinvoice");

class Controller {
    // Auth
    static async getLogin(req, res) {
        try {
            const { message, errors } = req.query
            res.render('login', { message, errors })
        } catch (error) {
            res.send(error)
        }
    }

    static async postLogin(req, res) {
        try {
            const { email, password } = req.body

            let errors = [];

            if (!email) {
                errors.push("Email is required");
            }

            if (!password) {
                errors.push("Password is required");
            }

            if (errors.length > 0) {
                return res.redirect(
                    `/login?errors=${errors}`
                );
            }

            let data = await User.findOne({
                where: {
                    email
                }
            })

            if (data) {
                const isValidPassword = bcrypt.compareSync(password, data.password)

                if (isValidPassword) {
                    req.session.userId = data.id
                    req.session.role = data.role

                    return res.redirect('/')
                } else {
                    return res.redirect('/login?message=Invalid password')
                }
            } else {
                return res.redirect('/login?message=Invalid email')
            }
        } catch (error) {
            res.send(error)
        }
    }

    static async getRegister(req, res) {
        try {
            const { errors } = req.query
            res.render('register', { errors })
        } catch (error) {
            res.send(error)
        }
    }

    static async postRegister(req, res) {
        try {
            const { username, email, role, password } = req.body

            await User.create({
                username, email, role, password
            })

            res.redirect('/login');
        } catch (error) {
            if (error.name === "SequelizeValidationError") {
                let errors = error.errors.map(el => el.message)
                res.redirect(`/register?errors=${errors}`);
            } else {
                res.send(error)
            }
        }
    }

    static async logout(req, res) {
        try {
            req.session.destroy(function (err) {
                if (err) {
                    res.send(err)
                } else {
                    res.redirect('/login')
                }
            })
        } catch (error) {
            res.send(error)
        }
    }

    static async home(req, res) {
        try {
            const { search, sort } = req.query;

            let order = [["createdAt", "DESC"]];

            if (sort === "price_asc") {
                order = [["price", "ASC"]];
            }

            if (sort === "price_desc") {
                order = [["price", "DESC"]];
            }

            const products = await Product.findAll({
                where: search
                    ? {
                        productName: {
                            [Op.iLike]: `%${search}%`,
                        },
                    }
                    : undefined,

                include: Category,

                order,
            });

            res.render("home", {
                title: "Vendra",
                products,
                search,
                sort,
                formatRp
            });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    static async productDetail(req, res) {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id, {
                include: [Category, User],
            });

            res.render("productDetail", {
                title: product.productName,
                product,
                formatRp
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

            if (!product) {
                return res.send("Product tidak ditemukan");
            }

            if (product.stock <= 0) {
                return res.send("Stock product habis");
            }

            const customerId = req.session.userId

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
                return total + (item.priceAtPurchase * item.quantity);
            }, order.totalOngkir);

            await order.save();

            res.send(`Product ${product.productName} berhasil ditambahkan ke cart`);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }

    static async cart(req, res) {
        try {
            const { errors, productId } = req.query
            const customerId = req.session.userId

            const order = await Order.findOne({
                where: {
                    CustomerId: customerId,
                    status: "Cart",
                },
            });

            if (!order) {
                return res.send("Cart masih kosong");
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
                return res.send("Cart masih kosong");
            }

            res.render("cart", {
                title: "Shopping Cart",
                order,
                orderItems,
                formatRp,
                errors,
                productId
            });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    static async removeFromCart(req, res) {
        try {
            const { productId } = req.params;

            const customerId = req.session.userId

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
            }, 0);

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

            const customerId = req.session.userId

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
            }, 0);

            await order.save();

            res.redirect("/cart");
        } catch (error) {
            if (error.name === "SequelizeValidationError") {
                let errors = error.errors.map(el => el.message)
                res.redirect(`/cart?errors=${errors}&productId=${productId}`);
            } else {
                res.send(error)
            }
        }
    }

    static async checkout(req, res) {
        try {
            const { errors } = req.query

            const customerId = req.session.userId

            const order = await Order.findOne({
                where: {
                    CustomerId: customerId,
                    status: "Cart",
                },
            });

            if (!order) {
                return res.send("Cart masih kosong");
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
                return res.send("Cart masih kosong");
            }

            res.render("checkout", {
                title: "Checkout",
                order,
                orderItems,
                formatRp,
                errors
            });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    }

    static async placeOrder(req, res) {
        try {
            const customerId = req.session.userId

            const { paymentMethod } = req.body;

            const order = await Order.findOne({
                where: {
                    CustomerId: customerId,
                    status: "Cart",
                },
            });

            if (!order) {
                return res.send("Cart masih kosong");
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
                return res.send("Cart masih kosong");
            }

            for (const item of orderItems) {
                if (item.quantity > item.Product.stock) {
                    return res.send(`Stock ${item.Product.productName} tidak mencukupi`);
                }
            }

            for (const item of orderItems) {
                item.Product.stock -= item.quantity;

                await item.Product.save();
            }

            order.paymentMethod = paymentMethod;
            order.status = "Pending";

            await order.save();

            res.send("Order berhasil dibuat");
        } catch (error) {
            if (error.name === "SequelizeValidationError") {
                let errors = error.errors.map(el => el.message)
                res.redirect(`/checkout?errors=${errors}`);
            } else {
                res.send(error)
            }
        }
    }

    static async orders(req, res) {
        try {
            const customerId = req.session.userId

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

            res.render("orders", {
                title: "My Orders",
                orders,
                formatRp
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

            if (!order) {
                return res.send("Order tidak ditemukan");
            }

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
