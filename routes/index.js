const express = require("express");
const router = express.Router();
const Controller = require("../controllers/controller");

// AUTH
router.get("/login", Controller.getLogin);
router.post("/login", Controller.postLogin);
router.get("/register", Controller.getRegister);
router.post("/register", Controller.postRegister);

// MIDDLEWARE
router.use((req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login?message=You must be login first!");
  } else {
    next();
  }
});

// LOGOUT
router.post("/logout", Controller.logout);

const isCustomer = function (req, res, next) {
  if (req.session.userId && req.session.role !== "customer") {
    res.redirect("/?message=You have no access!");
  } else {
    next();
  }
};

router.get("/", Controller.home);
router.get("/profile", Controller.getProfile);
router.get("/profile/edit", Controller.getEditProfile);
router.post("/profile", Controller.postProfile);
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
