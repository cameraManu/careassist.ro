import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { healthRouter } from "./routes/health.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/v1", healthRouter);
app.use("/api/v1", authRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`CareAssist backend listening on port ${port}`);
});
