const User = require("../models/user");
const UserVerification = require("../models/userVerification");
const transporter = require("../resources/nodemailerTransporter");

require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

function authController() {
  const sendVerificationEmail = ({ _id, email }, res) => {
    // baseURL to be used in the email
    const currentUrl = process.env.DOMAIN || "http://localhost:3000/";
    const uniqueString = uuidv4() + _id;

    // mail options
    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Verify your email address to complete the SignUp process.</p>`,
    };

    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Ready for messages");
        console.log(success);
      }
    });
  };

  return {
    // login a user
    async login(req, res) {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return res.status(400).send("All fields are required");
      }

      try {
        const user = await User.findOne({
          $and: [{ email: email }, { email_verified: true }],
        });

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
      const { username, email, password } = req.body;
      // Validate request
      if (!username || !email || !password) {
        return res.status(400).send("All Fields Required");
      }

      // Check if email exists
      users = await User.find({ email: email });
      const isValid = true;
      users.forEach((user) => {
        if (user.email_verified) {
          isValid = false;
        }
      });

      if (!isValid) {
        return res.status(400).send("Email already taken");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a user
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });

      user
        .save()
        .then((user) => {
          // handle verification
          sendVerificationEmail(user, res);
        })
        .catch((err) => {
          return res.status(500).send("Something went wrong");
        });
    },

    // logout a user
    logout(req, res) {
      try {
        res.clearCookie("token");
        return res.status(200).send("Signed Out Successfully");
      } catch (error) {
        return res.status(500).send(error);
      }
    },
  };
}

module.exports = authController;
