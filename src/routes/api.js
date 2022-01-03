const emailController = require("../controllers/users/emailController");
const authController = require("../controllers/authController");
const mainController = require("../controllers/users/mainController");

// Middlewares
const auth = require("../resources/nodemailerTransporter");

function initRoutes(app) {
  //   app.get("/", );

  app.post("/login", authController().login);
  app.post("/register", authController().register);
  app.post("/logout", auth, authController().logout);

  app.get("/user/verfiy/:id/:uniqueString", emailController().verify);
  app.get(
    "/user/reset-password/:id/:uniqueString",
    emailController().changePass
  );

  app.get("/users/:userId", auth, mainController().getUser);
  app.get("/users", auth, mainController().getUsers);
  app.put("/users", auth, mainController().updateUser);
  app.delete("/users", auth, mainController().deleteUser);
  app.post("/users/forgot-password", auth, mainController.updatePassword);
}

module.exports = initRoutes;
