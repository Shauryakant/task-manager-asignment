import { body, param, query } from "express-validator";
import { TASK_STATUSES } from "../models/task.model.js";

const strongPasswordRule = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must include one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must include one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must include one number");

export const registerValidator = () => [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  strongPasswordRule,
];

export const loginValidator = () => [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const taskCreateValidator = () => [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage("Invalid status value"),
];

export const taskUpdateValidator = () => [
  param("taskId").isMongoId().withMessage("Invalid task id"),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().isString(),
  body("status")
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage("Invalid status value"),
];

export const taskIdValidator = () => [
  param("taskId").isMongoId().withMessage("Invalid task id"),
];

export const taskListQueryValidator = () => [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("status")
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage("Invalid status filter"),
  query("search").optional().isString(),
];
