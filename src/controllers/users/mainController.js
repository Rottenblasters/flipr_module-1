const User = require("../../models/user");
const PasswordVerification = require("../../models/passwordVerification");
const transporter = require("../../resources/nodemailerTransporter");

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

function mainController() {
  const sendVerificationEmail = async ({ _id, email }, req, res) => {
    const { newPswd } = req.body;
    // baseURL to be used in the email
    const currentUrl = process.env.DOMAIN || "http://localhost:3000/";
    const uniqueString = uuidv4() + _id;

    // mail options
    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: "Password Reset Link",
      html: `
          <p><b>Click the link below to verify password reset</b></p>
          <div><a href=${
            currentUrl + "user/reset-password/" + _id + "/" + uniqueString
          }>Verify</a></div>`,
    };
    try {
      const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
      const hashedPassword = await bcrypt.hash(newPswd, 10);
      // save password verfication
      const newPasswordVerification = new PasswordVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        newPassword : hashedPassword,
      });
      await newPasswordVerification.save();

      // send mail
      await transporter.sendMail(mailOptions);

      return res.status(200).send("Password Reset link sent");
    } catch (error) {
      return res.status(500).send("Something went wrong!");
    }
  };
  return {
    // get a particular user
    async getUser(req, res) {
      const { ID } = req.body;
      const { userId } = req.params;
      
      const user = await User.findById(userId);
      try {
        // check if user exists
        if (!user || user.email_verified !== true) {
          return res.status(400).send("User Not Found");
        }
        // check if user is owner
        if (user.isPublic || userId === ID) {
          return res.status(200).send(user);
        } else {
          return res.status(200).send({ username: user.username });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    },

    // get all users based on query
    async getUsers(req, res) {
      const { q } = req.query;
      try {
        const users = await User.find({
          $and: [
            { username: { $regex: ".*" + q + ".*" } },
            { email_verified: true },
          ],
        });

        // filter users
        result = [];
        users.forEach((user) => {
          // check if user account is public or it is owner
          if (user.isPublic || user._id.toString() == ID.toString) {
            result.push(user);
          } else {
            newUser = { username: user.username };
            result.push(newUser);
          }
        });

        return res.status(200).send(result);
      } catch {
        return res.status(500).send(error);
      }
    },

    // update user
    async updateUser(req, res) {
      const { ID, username, isPublic } = req.body;
      console.log(username, isPublic);
      const user = await User.findById(ID);
      try {
        // check if user exists
        if (!user) {
          return res.status(400).send("User Not Found");
        }

        // update user
        user.username = username !== undefined ? username : user.username;
        user.isPublic = isPublic !== undefined ? isPublic : user.isPublic;

        await user.save();

        return res.status(200).send("User updated");
      } catch (error) {
        return res.status(500).send(error);
      }
    },

    // delete an user
    async deleteUser(req, res) {
      const { ID } = req.body;
      const user = await User.findById(ID);
      try {
        // check if user exists
        if (!user) {
          return res.status(400).send("User Not Found");
        }
        // delete the user
        await User.findByIdAndDelete(ID);
        res.clearCookie("token");
        return res.status(200).send("Successfully Deleted User");
      } catch (error) {
        return res.status(500).send(error);
      }
    },

    // update password
    async updatePassword(req, res) {
      const { ID, newPswd, confirmPswd } = req.body;
      console.log(ID, newPswd, confirmPswd);
      try {
        if (newPswd !== confirmPswd) {
          return res.status(400).send("Passwords dont match!");
        }

        const user = await User.findById(ID);
        if (!user) {
          res.status(400).send("User not found");
        }

        // handle verification
        sendVerificationEmail(user, req, res);
      } catch (error) {
        return res.status(500).send(error);
      }
    },
  };
}

module.exports = mainController;
