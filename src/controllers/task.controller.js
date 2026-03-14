import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { decryptField, encryptField } from "../utils/crypto.js";

const serializeTask = (task) => ({
  _id: task._id,
  title: task.title,
  description: decryptField(task.descriptionEncrypted),
  status: task.status,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    user: req.user._id,
    title: req.body.title,
    descriptionEncrypted: encryptField(req.body.description || ""),
    status: req.body.status || "todo",
  });

  res
    .status(201)
    .json(new ApiResponse(201, { task: serializeTask(task) }, "Task created"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const skip = (page - 1) * limit;

  const query = { user: req.user._id };
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: "i" };
  }

  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tasks: tasks.map(serializeTask),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      "Tasks fetched successfully",
    ),
  );
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, { task: serializeTask(task) }, "Task fetched"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.taskId, user: req.user._id });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (typeof req.body.title !== "undefined") {
    task.title = req.body.title;
  }
  if (typeof req.body.description !== "undefined") {
    task.descriptionEncrypted = encryptField(req.body.description);
  }
  if (typeof req.body.status !== "undefined") {
    task.status = req.body.status;
  }

  await task.save();

  res
    .status(200)
    .json(new ApiResponse(200, { task: serializeTask(task) }, "Task updated"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.taskId,
    user: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.status(200).json(new ApiResponse(200, null, "Task deleted"));
});
