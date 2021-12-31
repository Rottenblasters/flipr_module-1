const jwt = require("jsonwebtoken");

// user authentication middleware
module.exports = (req, res, next) => {
  const { token } = req.cookies;
  try {
    // check if user is logedIn
    if (!token) {
      return res.status(400).send(`Unauthorized`);
    }

    // get id of the user
    const { userId } = jwt.verify(token, process.env.COOKIE_SECRET);
    req.body.userId = userId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Unauthorized`);
  }
};