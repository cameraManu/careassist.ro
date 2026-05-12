import cors from "cors";
import type { CorsOptions } from "cors";
import dotenv from "dotenv";
import express from "express";
import { verifyDatabaseConnection } from "./config/db.js";
import { authRouter } from "./routes/auth.routes.js";
import { dataRouter } from "./routes/data.routes.js";
import { healthRouter } from "./routes/health.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

/** Origini permise pentru CORS când frontend-ul e servit de pe domeniul din `front_domain` (mediu Docker). */
function normalizeOriginForCors(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  return `https://${trimmed}`.replace(/\/+$/, "");
}

function buildCorsOptions(): CorsOptions {
  const raw = process.env.front_domain?.trim();
  if (!raw) {
    return { origin: true };
  }
  const origins = raw
    .split(",")
    .map((entry) => normalizeOriginForCors(entry))
    .filter(Boolean);
  if (origins.length === 0) {
    return { origin: true };
  }
  if (origins.length === 1) {
    return { origin: origins[0] };
  }
  return { origin: origins };
}

app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: "1mb" }));
app.use("/api/v1", healthRouter);
app.use("/api/v1", authRouter);
app.use("/api/v1", dataRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function bootstrapServer(): Promise<void> {
  await verifyDatabaseConnection();
  console.log("Database connection established successfully");

  const server = app.listen(port, () => {
    console.log(`CareAssist backend listening on port ${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the existing process or change PORT in backend/.env.`);
      process.exit(1);
    }

    console.error("Failed to start backend server", error);
    process.exit(1);
  });
}

void bootstrapServer().catch((error) => {
  console.error("Failed to start backend due to database connectivity issue", error);
  process.exit(1);
});
