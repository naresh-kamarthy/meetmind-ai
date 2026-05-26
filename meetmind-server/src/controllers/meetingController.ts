import { Response, NextFunction } from "express";
import { Meeting } from "../models/Meeting.js";
import { Task } from "../models/Task.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { AIService } from "../services/aiService.js";

// Create meeting note
export const createMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, rawNotes, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const meeting = new Meeting({
      title,
      rawNotes,
      tags: tags || [],
      createdBy: userId
    });

    await meeting.save();
    return res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
};

// Get meetings list (with optional search, filter by tag, pagination)
export const getMeetings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { search, tag, page = 1, limit = 10 } = req.query;

    const query: any = { createdBy: userId };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (tag) {
      query.tags = tag;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.json({
      meetings,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};

// Get single meeting
export const getMeetingById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    return res.json(meeting);
  } catch (error) {
    next(error);
  }
};

// Update meeting note
export const updateMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, rawNotes, tags } = req.body;

    const meeting = await Meeting.findOne({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (title !== undefined) meeting.title = title;
    if (rawNotes !== undefined) meeting.rawNotes = rawNotes;
    if (tags !== undefined) meeting.tags = tags;

    await meeting.save();
    return res.json(meeting);
  } catch (error) {
    next(error);
  }
};

// Delete meeting
export const deleteMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const meeting = await Meeting.findOneAndDelete({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Also delete linked tasks
    await Task.deleteMany({ linkedMeeting: id, createdBy: userId });

    return res.json({ message: "Meeting and linked tasks deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// AI: Generate summary
export const generateMeetingSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.rawNotes || meeting.rawNotes.trim().length === 0) {
      return res.status(400).json({ message: "Meeting notes are empty. Cannot generate summary." });
    }

    const summary = await AIService.generateSummary(meeting.rawNotes);
    meeting.aiSummary = summary;
    await meeting.save();

    return res.json(meeting);
  } catch (error) {
    next(error);
  }
};

// AI: Generate follow-up email
export const generateMeetingEmail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const overview = meeting.aiSummary?.overview || "This is a meeting follow-up.";
    const actionItems = meeting.aiSummary?.actionItems || [];

    const emailText = await AIService.generateFollowUpEmail(meeting.rawNotes, overview, actionItems);
    meeting.followUpEmail = emailText;
    await meeting.save();

    return res.json(meeting);
  } catch (error) {
    next(error);
  }
};

// AI: Generate smart tasks from meeting notes
export const generateMeetingTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const meeting = await Meeting.findOne({ _id: id, createdBy: userId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.rawNotes || meeting.rawNotes.trim().length === 0) {
      return res.status(400).json({ message: "Meeting notes are empty. Cannot generate tasks." });
    }

    const aiTasks = await AIService.generateTasks(meeting.rawNotes);
    const createdTasks = [];

    for (const t of aiTasks) {
      const task = new Task({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: "Todo",
        linkedMeeting: meeting._id,
        createdBy: userId,
        assignedUser: userId
      });
      await task.save();
      createdTasks.push(task);
    }

    return res.json({
      message: `${createdTasks.length} tasks successfully extracted and created!`,
      tasks: createdTasks
    });
  } catch (error) {
    next(error);
  }
};
