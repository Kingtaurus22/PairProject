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
router.post("/orders/cart/add/:productId", isCustomer, Controller.addToCart);
router.get("/cart", isCustomer, Controller.cart);
router.post(
  "/orders/cart/remove/:productId",
  isCustomer,
  Controller.removeFromCart,
);
router.post(
  "/orders/cart/update/:productId",
  isCustomer,
  Controller.updateCart,
);
router.get("/checkout", isCustomer, Controller.checkout);
router.post("/checkout", isCustomer, Controller.placeOrder);
router.get("/orders", isCustomer, Controller.orders);
router.get("/orders/:id/invoice", isCustomer, Controller.invoice);

module.exports = router;
