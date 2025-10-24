import type { UserProps } from "../types.ts";
import jwt from "jsonwebtoken";

export const generateToken = (user: UserProps) => {
  const payload = {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// Token expiration options:
// "60s" means the token will expire in 60 seconds
// "1h" means the token will expire in 1 hour
// "7d" means the token will expire in 7 days
// "24h" means the token will expire in 24 hours
// "30d" means the token will expire in 30 days
// "1y" means the token will expire in 1 year
