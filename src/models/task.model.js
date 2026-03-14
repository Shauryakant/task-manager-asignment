import mongoose, { Schema } from "mongoose";

const allowedStatuses = ["todo", "in_progress", "done"];

const taskSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionEncrypted: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: allowedStatuses,
      default: "todo",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "assignment_tasks",
  },
);

taskSchema.index({ user: 1, title: 1 });

export const TASK_STATUSES = allowedStatuses;
export const Task = mongoose.model("Task", taskSchema);
