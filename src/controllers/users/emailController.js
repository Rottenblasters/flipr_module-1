const UserVerification = require("../../models/userVerification");
const User = require("../../models/user");

const bcrypt = require("bcrypt");

function emailController() {
  return {
    // to verify email during signup
    async verify(req, res) {
      const { userId, uniqueString } = req.params;

      try {
        const userVerification = await UserVerification.findOne({ userId });
        // validate
        if (!userVerification) {
          return res.status(400).send("Verification Link Incorrect!");
        }

        // check unique string
        const hashedUniqueString = userVerification.uniqueString;
        const isValid = await bcrypt.compare(uniqueString, hashedUniqueString);
        if (isValid) {
          const user = await User.findById({ userId });
          if (!user) {
            return res.status(400).send("Verification Link Incorrect!");
          }

          // change verified status
          user.email_verified = true;
          await user.save();

          return res.status(200).send("Account Verified");
        } else {
          return res.status(400).send("Verification Link Incorrect!");
        }
      } catch {
        return res.status(500).send("Something Went Wrong!");
      }
    },

    // to verify password change
    async changePass(req, res) {},
  };
}

module.exports = emailController;
