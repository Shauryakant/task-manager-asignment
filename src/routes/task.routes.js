import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  taskCreateValidator,
  taskIdValidator,
  taskListQueryValidator,
  taskUpdateValidator,
} from "../utils/validators.js";

const router = Router();

router.use(requireAuth);

router
  .route("/")
  .get(taskListQueryValidator(), validate, getTasks)
  .post(taskCreateValidator(), validate, createTask);

router
  .route("/:taskId")
  .get(taskIdValidator(), validate, getTaskById)
  .put(taskUpdateValidator(), validate, updateTask)
  .delete(taskIdValidator(), validate, deleteTask);

export default router;
