const User = require("../../models/user");
const PasswordVerification = require("../../models/passwordVerification");
const transporter = require("../../resources/nodemailerTransporter");

const bcrypt = require("bcrypt");

function mainController() {
  const sendVerificationEmail = ({ _id, email }, res) => {
    // baseURL to be used in the email
    const currentUrl = process.env.DOMAIN || "http://localhost:3000/";
    const uniqueString = uuidv4() + _id;

    // mail options
    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: "Password Reset Link",
      html: `
          <p><b>Provide your new password below</b>
          <div><form action=${
            currentUrl + "user/reset-password/" + _id + "/" + uniqueString
          }>
          <label for="newPswd">New Password</label>
          <input type="password" id="newPswd" name="newPswd" required>
          <label for="confirmPswd">Confirm Password</label>
          <input type="password" id="confirmPswd" name="confirmPswd" required>
          <input type="submit" value="Submit">
          </form></div>`,
    };
    try {
      const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
      // save password verfication
      const newPasswordVerification = new PasswordVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
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
      const { userId } = req.param;
      const user = await User.findById(userId);
      try {
        // check if user exists
        if (!user && user.email_verified === true) {
          return res.status(400).send("User Not Found");
        }
        // check if user is owner
        if (user.isPublic || userId.toString() === ID.toString()) {
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
      const user = await User.findById(ID);
      try {
        // check if user exists
        if (!user) {
          return res.status(400).send("User Not Found");
        }

        // update user
        user.username = username === undefined ? username : user.username;
        user.isPublic = isPublic === undefined ? isPublic : user.isPublic;

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
        await UserModel.findByIdAndDelete(userId);
        res.clearCookie("token");
        return res.status(200).send("Successfully Deleted User");
      } catch (error) {
        return res.status(500).send(error);
      }
    },

    // update password
    async updatePassword(req, res) {
      const { ID } = req.body;

      const user = await User.findById(ID);
      if (!user) {
        res.status(400).send("User not found");
      }

      // handle verification
      sendVerificationEmail(user, req);
    },
  };
}

module.exports = mainController;
