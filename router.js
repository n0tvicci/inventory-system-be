const {
  signup,
  signin,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("./controllers/authentication");
const {
  createProduct,
  getProducts,
  getOneProduct,
  deleteProduct,
  updateProduct,
} = require("./controllers/product");
const { contactUs } = require("./controllers/contact");
const { upload } = require("./utils/fileUpload");

const passport = require("passport");
require("./services/passport")(passport);

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignIn = passport.authenticate("local-login", { session: false });

module.exports = function (app) {
  app.get("/api/test", (req, res, next) => {
    res.send("Testing");
  });

  app.post("/api/signup", signup);
  app.post("/api/signin", requireSignIn, signin);
  app.get("/api/me", requireAuth, me);
  app.post("/api/profile", requireAuth, updateProfile);
  app.post("/api/changePassword", requireAuth, changePassword);
  app.post("/api/forgotPassword", forgotPassword);
  app.put("/api/resetpassword/:resetToken", resetPassword);

  app.post(
    "/api/createProduct",
    requireAuth,
    upload.single("image"),
    createProduct
  ); //Upload only single file
  // app.post("/api/createProduct", upload.array("image"), createProduct); Upload multiple file
  app.get("/api/getProducts", requireAuth, getProducts);
  app.get("/api/getOneProduct/:id", requireAuth, getOneProduct);
  app.post("/api/deleteProduct/:id", requireAuth, deleteProduct);
  app.post("/api/updateProduct/:id", requireAuth, updateProduct);

  app.post("/api/contactus", requireAuth, contactUs);
};
