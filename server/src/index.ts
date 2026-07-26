import express from "express";
import cors from "cors";
import { getEnv } from "./env";

const app = express();
app.use(
  cors({
    origin: getEnv().WEB_ORIGIN,
    methods: ["GET", "OPTIONS"],
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

function start(): void {
  try {
    const env = getEnv();
    app.listen(env.PORT, () => {
      console.log(`[server] listening on port: ${env.PORT}`);
    });
  } catch (error) {
    console.error(
      "[server] failed to start",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

start();

process.on("unhandledRejection", (reason) => {
  console.error("[server] unhandled rejection", reason);
});
