import pino from "pino";

import { ENV } from "./env";

const LOG_LEVEL = ENV.LOG_LEVEL || "info";

const logger = pino({
  level: LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: true,
    },
  },
});

export default logger;