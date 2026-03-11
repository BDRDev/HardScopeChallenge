import { Router } from "express";
import { getCreators } from "../services/sociavault.js";

const router = Router();

const SOCIAVAULT_API_KEY = process.env.SOCIAVAULT_API_KEY;

router.get("/creators", async (_req, res) => {
  if (!SOCIAVAULT_API_KEY) {
    return res.status(500).json({
      error: "Server misconfiguration",
      message: "SOCIAVAULT_API_KEY is not set",
    });
  }

  const creators = await getCreators(SOCIAVAULT_API_KEY);
  res.json({ creators });
});

export default router;
