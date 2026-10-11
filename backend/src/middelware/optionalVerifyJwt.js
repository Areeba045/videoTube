import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const optionalVerifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const Token =
      req.cookies?.accessToken ||
      req.header("Authoraization")?.replace("Bearer", "");

    if (!Token) {
      req.user = null ;
      return next();
    //   throw new ApiError(401, "unauthorized Request");
    }

    const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      " -password -refreshToken"
    );

    if (!user) {
      req.user = null;
      return next();
      // throw new ApiError(401, "Invalid Access Token");
    }

    // if (user) {
      req.user = user ;
    // }

    next();
  } catch (error) {
    req.user = null ;
    return next();
    // throw new ApiError(401, error.message || "Invalid access token ");
  }
});
