const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function authController() {
  return {
      
    // login a user
    async login(req, res) {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).send("All fields are required");
      }

      try {
        const user = await UserModel.findOne({
          email: email.toLowerCase(),
        }).select("+password");

        // check if user exists
        if (!user) {
          return res.status(401).send("Invalid Credentials");
        }

        // verify password
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
          return res.status(401).send("Invalid Credentials");
        }

        // generate jwt token
        const payload = { userId: user._id };
        jwt.sign(
          payload,
          process.env.COOKIE_SECRET,
          { expiresIn: "1d" },
          (err, token) => {
            if (err) {
              return res.status(500).send(err);
            }
            return res
              .cookie("token", token)
              .status(200)
              .send("Signed In Successfully");
          }
        );
      } catch (error) {
        console.error(error);
        return res.status(500).send(`Server error`);
      }
    },

    // register a user
    async register(req, res) {
      const { name, email, password } = req.body;
      // Validate request
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Check if email exists
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash("error", "Email already taken");
          req.flash("name", name);
          req.flash("email", email);
          return res.redirect("/register");
        }
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a user
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      user
        .save()
        .then((user) => {
          // Login
          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong");
          return res.redirect("/register");
        });
    },

    // logout a user
    logout(req, res) {
      try {
        res.clearCookie("token");
        return res.status(200).send("Signed Out Successfully");
      } catch (error) {
        res.status(500).send(error);
      }
    },

    // delete an user
    async delete(req, res) {
      const { userId } = req.body;
      const user = await UserModel.findById(userId);
      try {
        // check if user exists
        if (!user) {
          res.status(500).send("User Not Found");
        }
        // delete the user
        await UserModel.findByIdAndDelete(userId);
        res.clearCookie("token");
        res.status(200).send("Successfully Deleted User");
      } catch (error) {
        res.status(500).send(error);
      }
    },
  };
}

module.exports = authController;
