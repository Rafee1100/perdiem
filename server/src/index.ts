import express from "express";
import cors from "cors";
import { getEnv } from "./env";
import { locationsRouter } from "./routes/locations";
import { menuRouter } from "./routes/menu";
import { itemsRouter } from "./routes/items";
import { handleError, notFoundHandler } from "./lib/http";
import { ApiErrorBody } from "./shared";

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

app.use("/api/locations", locationsRouter);
app.use("/api/menus", menuRouter);
app.use("/api/items", itemsRouter);

app.use(notFoundHandler);
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response<ApiErrorBody>,
    next: express.NextFunction,
  ) => handleError(err, req, res, next),
);

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