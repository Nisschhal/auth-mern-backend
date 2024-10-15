import jwt from "jsonwebtoken";

/** * VERIFY THE TOKEN:
 * get the token
 * decode the token
 * attach the user id from decoded token to request object
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no Token Provided!" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid token!" });
    console.log(decodedToken);
    const userId = decodedToken.userId;
    req.userId = userId;
  } catch (error) {
    console.log(`Error while verifying Token: ${error.message}`);
  }

  next();
};
