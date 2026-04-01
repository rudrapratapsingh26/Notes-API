import {User} from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js"; 
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken();
       const refreshToken = user.generateRefreshToken();
         user.refreshToken = refreshToken;
         await user.save({validateBeforeSave: false});
         return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{username},{email}] });
    if (existingUser) {
        throw new ApiError(400, "Email already in use");
    }
    const user = new User({ username, email, password });
    await user.save();
    const { tempTokenUnHashed, tempTokenHashed, tokenExpiry } =user.generateTemporaryToken();
    return res.status(201).json(new ApiResponse(201, { id: user._id, email: user.email, username: user.username }, "User registered successfully"));
});

