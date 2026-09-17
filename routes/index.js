const express = require("express");
const router = express.Router();
const Controller = require("../controllers/controller");

router.get("/", Controller.home);
router.get("/products/:id", Controller.productDetail);
router.post("/orders/cart/add/:productId", Controller.addToCart);
router.get("/cart", Controller.cart);
router.post("/orders/cart/remove/:productId", Controller.removeFromCart);
router.post("/orders/cart/update/:productId", Controller.updateCart);
router.get("/checkout", Controller.checkout);
router.post("/checkout", Controller.placeOrder);
router.get("/orders", Controller.orders);
router.get("/orders/:id/invoice", Controller.invoice);

module.exports = router;
