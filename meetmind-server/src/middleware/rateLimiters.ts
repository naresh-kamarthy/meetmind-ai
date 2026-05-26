import rateLimit from "express-rate-limit";

const jsonRateLimitMessage = (title: string) => ({
  success: false,
  code: "RATE_LIMIT_EXCEEDED",
  message: title,
  retryAfterMinutes: 15,
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      jsonRateLimitMessage("Too many requests. Please try again in 15 minutes.")
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      jsonRateLimitMessage(
        "Too many authentication attempts. Please try again in 15 minutes."
      )
    );
  },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(
      jsonRateLimitMessage(
        "AI generation limit reached. Please wait before generating more content."
      )
    );
  },
});
