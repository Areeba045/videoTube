import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const optionalVerifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const Token =
      req.cookies?.accessToken ||
      req.header("Authoraization")?.replace("Bearer", "");

    if (!Token) {
      req.user = null;
      return next();
    }

    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      " -password -refreshToken"
    );

    if (!user) {
      req.user = null;
      return next();
    }
    req.user = user;

    next();
  } catch (error) {
    req.user = null;
    return next();
  }
});
