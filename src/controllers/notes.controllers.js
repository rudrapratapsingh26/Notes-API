import mongoose from "mongoose";
import { Note } from "../models/notes.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes retrieved successfully"));
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, isPinned } = req.body;
  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }
  const note = await Note.create({
    title,
    content,
    tags,
    isPinned,
    userId: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

export const getNote = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid note ID");
  }
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw new ApiError(404, "Note not found");
  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note retrieved successfully"));
});

export const updateNote = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    throw new ApiError(400, "At least one field is required to update");
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid note ID");
  }
  const { title, content, tags, isPinned } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (tags !== undefined) updateData.tags = tags;
  if (isPinned !== undefined) updateData.isPinned = isPinned;

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    updateData,
    { new: true }
  );
  if (!note) throw new ApiError(404, "Note not found");
  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

export const deleteNote = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid note ID");
  }
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!note) throw new ApiError(404, "Note not found");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});
