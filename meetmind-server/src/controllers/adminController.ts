import { Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { Meeting } from "../models/Meeting.js";
import { Task } from "../models/Task.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { formatUserResponse } from "../utils/userResponse.js";

// Fetch all system analytics, activity logs, and SVG chart data
export const getAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalMeetings = await Meeting.countDocuments({});
    const totalTasks = await Task.countDocuments({});

    // Calculated real AI metrics
    const meetingsWithSummary = await Meeting.countDocuments({ "aiSummary.overview": { $ne: "" } });
    const meetingsWithEmail = await Meeting.countDocuments({ followUpEmail: { $ne: "" } });
    const tasksFromMeetings = await Task.countDocuments({ linkedMeeting: { $ne: null } });
    
    // Total requests = summary generated + email generated + smart tasks extracted
    const aiRequestsCount = meetingsWithSummary + meetingsWithEmail + tasksFromMeetings;

    // Active users: updated in the last 30 days
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Compile dynamic past 7 days metrics for custom visual SVG charts
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const usersCount = await User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const meetingsCount = await Meeting.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const tasksCount = await Task.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
      
      const summaryCount = await Meeting.countDocuments({ 
        "aiSummary.overview": { $ne: "" }, 
        updatedAt: { $gte: startOfDay, $lte: endOfDay } 
      });
      const emailCount = await Meeting.countDocuments({ 
        followUpEmail: { $ne: "" }, 
        updatedAt: { $gte: startOfDay, $lte: endOfDay } 
      });
      const aiCount = summaryCount + emailCount;

      const dayLabel = startOfDay.toLocaleDateString("en-US", { weekday: "short" });
      chartData.push({
        date: dayLabel,
        users: usersCount,
        meetings: meetingsCount,
        tasks: tasksCount,
        aiRequests: aiCount
      });
    }

    // Compile dynamic user activity logs from records
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentMeetings = await Meeting.find({}).populate("createdBy", "name email").sort({ createdAt: -1 }).limit(5);
    const recentTasks = await Task.find({}).populate("createdBy", "name email").sort({ createdAt: -1 }).limit(5);

    const activities = [
      ...recentUsers.map(u => ({
        id: u._id,
        type: "user_registered",
        message: `${u.name} joined the platform as a ${u.role}.`,
        user: { name: u.name, email: u.email },
        timestamp: u.createdAt
      })),
      ...recentMeetings.map(m => ({
        id: m._id,
        type: "meeting_created",
        message: `${(m.createdBy as any)?.name || "A user"} created meeting note: "${m.title}"`,
        timestamp: m.createdAt
      })),
      ...recentTasks.map(t => ({
        id: t._id,
        type: "task_created",
        message: `${(t.createdBy as any)?.name || "A user"} created task card: "${t.title}"`,
        timestamp: t.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return res.json({
      stats: {
        totalUsers,
        totalMeetings,
        totalTasks,
        aiRequestsCount,
        activeUsers
      },
      chartData,
      activities
    });
  } catch (error) {
    next(error);
  }
};

// Fetch searchable/filterable list of all users
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role, status } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select("-password");
    return res.json(users.map((u) => formatUserResponse(u)));
  } catch (error) {
    next(error);
  }
};

// Update user role (cannot demote yourself)
export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (String(id) === String(req.user?.id)) {
      return res.status(400).json({ message: "Operation denied. You cannot modify your own administrative role." });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role as "user" | "admin";
    await user.save();

    return res.json({
      message: `User role successfully updated to ${role}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Toggle user deactivation status (cannot deactivate yourself)
export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (String(id) === String(req.user?.id)) {
      return res.status(400).json({ message: "Operation denied. You cannot deactivate your own administrative account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !!isActive;
    await user.save();

    return res.json({
      message: `User account has been successfully ${user.isActive ? "activated" : "deactivated"}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete a user along with cascade deletion of their meetings and tasks
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.user?.id)) {
      return res.status(400).json({ message: "Operation denied. You cannot delete your own administrative account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascade delete meetings and tasks
    await Meeting.deleteMany({ createdBy: id });
    await Task.deleteMany({ createdBy: id });
    await User.findByIdAndDelete(id);

    return res.json({
      message: "User and all related meetings and tasks have been permanently deleted from the database."
    });
  } catch (error) {
    next(error);
  }
};
