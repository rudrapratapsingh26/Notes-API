import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,    match: /^\S+@\S+\.\S+$/,
  },
  refreshToken: {
    type: String,
    default: null,
  },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id,
       email: this.email,
       username: this.username
       },
        process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id,
       email: this.email,
        username: this.username
    },
        process.env.REFRESH_TOKEN_SECRET,
         { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
}

userSchema.methods.generateTemporaryToken = function () {
    const tempTokenUnHashed = crypto.randomBytes(32).toString("hex");
    const tempTokenHashed = crypto.createHash("sha256").update(tempTokenUnHashed).digest("hex");
    const tokenExpiry = Date.now() + 20 * 60 * 1000;
    return {tempTokenUnHashed, tempTokenHashed, tokenExpiry}; 
}

export const User = mongoose.model("User", userSchema);


     