const User = require("../../models/user");

function mainController() {
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
    async updatePassword(req, res) {},
  };
}
