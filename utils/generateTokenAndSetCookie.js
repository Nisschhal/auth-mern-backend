import jwt from "jsonwebtoken";
// get the response object and user id
// create a jsonwebtoken with the given id and set it as cookie in header
export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // set the cookie into header as 'token'
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sitename: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  console.log("JWT token generated and set to Cookie:token");
  return token;
};
