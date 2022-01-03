const emailController = require("../controllers/users/emailController");
const authController = require("../controllers/authController");
const mainController = require("../controllers/users/mainController");

// Middlewares
const auth = require("../middleware/auth");

function initRoutes(app) {
  //   app.get("/", );

  app.post("/login", authController().login);
  app.post("/register", authController().register);
  app.post("/logout", auth, authController().logout);

  app.get("/user/verify/:userId/:uniqueString", emailController().verify);
  app.get("/user/reset-password/:userId/:uniqueString", emailController().changePass);

  app.get("/users/:userId", auth, mainController().getUser);
  app.get("/users", auth, mainController().getUsers);
  app.put("/user", auth, mainController().updateUser);
  app.delete("/user", auth, mainController().deleteUser);
  app.post("/users/forgot-password", auth, mainController().updatePassword);
}

module.exports = initRoutes;
