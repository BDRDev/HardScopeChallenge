import "dotenv/config";
import express from "express";
import cors from "cors";
import creatorRoutes from "./routes/creator.js";
import analyticsRoutes from "./routes/analytics.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.use("/", creatorRoutes);
app.use("/", analyticsRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Hello from Express" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
