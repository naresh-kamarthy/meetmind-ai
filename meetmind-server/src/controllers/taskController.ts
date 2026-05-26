import { Response, NextFunction } from "express";
import { Task } from "../models/Task.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { title, description, priority, dueDate, status, linkedMeeting } = req.body;

    const task = new Task({
      title,
      description,
      priority: priority || "Medium",
      dueDate: dueDate || null,
      status: status || "Todo",
      linkedMeeting: linkedMeeting || null,
      createdBy: userId,
      assignedUser: userId
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { status, priority, search, linkedMeeting } = req.query;

    const query: any = { createdBy: userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (linkedMeeting) query.linkedMeeting = linkedMeeting;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("linkedMeeting", "title")
      .populate("assignedUser", "name email avatar avatarType")
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, createdBy: userId })
      .populate("linkedMeeting", "title")
      .populate("assignedUser", "name email avatar avatarType");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, priority, dueDate, status, linkedMeeting } = req.body;

    const task = await Task.findOne({ _id: id, createdBy: userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (linkedMeeting !== undefined) task.linkedMeeting = linkedMeeting;

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("linkedMeeting", "title")
      .populate("assignedUser", "name email avatar avatarType");

    return res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, createdBy: userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
