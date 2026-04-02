import {User} from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js"; 
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
       const user = await User.findById(userId);
       if (!user) {
        throw new ApiError(404, "User not found while generating tokens");
       }
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();
         user.refreshToken = refreshToken;
         await user.save({validateBeforeSave: false});
         return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Failed to generate tokens");
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
        throw new ApiError(400, "Username, email and password are required");
    }
    const existingUser = await User.findOne({ $or: [{username},{email}] });
    if (existingUser) {
        throw new ApiError(400, "Username or email already in use");
    }
    const user = new User({ username, email, password });
    await user.save();
    return res.status(201).json(new ApiResponse(201, { id: user._id, email: user.email, username: user.username }, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  req.user.refreshToken = null;
  await req.user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

