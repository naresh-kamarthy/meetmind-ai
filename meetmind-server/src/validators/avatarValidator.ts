import { z } from "zod";

export const avatarUrlSchema = z.object({
  body: z.object({
    url: z.string().url("Avatar must be a valid HTTPS/HTTP URL"),
  }),
});
