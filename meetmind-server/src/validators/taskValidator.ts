import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
    dueDate: z.string().optional().nullable(),
    status: z.enum(["Todo", "In Progress", "Completed"]).optional(),
    linkedMeeting: z.string().optional().nullable()
  })
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
    dueDate: z.string().optional().nullable(),
    status: z.enum(["Todo", "In Progress", "Completed"]).optional(),
    linkedMeeting: z.string().optional().nullable()
  })
});
