import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const env = createEnv({
  server: {
    DATABASE_URL: type("string.url"),
    JWT_SECRET: type("string"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
