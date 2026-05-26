import { z } from "zod";

export const createMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    rawNotes: z.string().min(1, "Notes cannot be empty"),
    tags: z.array(z.string()).optional()
  })
});

export const updateMeetingSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional(),
    rawNotes: z.string().min(1, "Notes cannot be empty").optional(),
    tags: z.array(z.string()).optional()
  })
});
