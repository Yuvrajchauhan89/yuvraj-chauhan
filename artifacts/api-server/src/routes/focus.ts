import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { focusDataTable } from "@workspace/db/schema";
import { RecordFocusDataBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/record", async (req, res) => {
  try {
    const body = RecordFocusDataBody.parse(req.body);

    const [dataPoint] = await db
      .insert(focusDataTable)
      .values({
        sessionId: body.sessionId,
        focusScore: body.focusScore,
        focusCategory: body.focusCategory,
        eyeOpenness: body.eyeOpenness ?? null,
        gazeDirection: body.gazeDirection ?? null,
        blinkRate: body.blinkRate ?? null,
        headPose: body.headPose ?? null,
        isDistraction: body.isDistraction,
      })
      .returning();

    res.status(201).json(dataPoint);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

export default router;
