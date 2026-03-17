import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, focusDataTable } from "@workspace/db/schema";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";
import {
  GetSessionsQueryParams,
  CreateSessionBody,
  GetSessionParams,
  EndSessionParams,
  EndSessionBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = GetSessionsQueryParams.parse(req.query);
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const sessions = await db
      .select()
      .from(sessionsTable)
      .orderBy(desc(sessionsTable.startTime))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessionsTable);

    const total = countResult[0]?.count ?? 0;

    res.json({ sessions, total });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateSessionBody.parse(req.body);
    const [session] = await db
      .insert(sessionsTable)
      .values({ label: body.label ?? null, status: "active" })
      .returning();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetSessionParams.parse(req.params);

    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id));

    if (!session) {
      return res.status(404).json({ error: "not_found", message: "Session not found" });
    }

    const focusData = await db
      .select()
      .from(focusDataTable)
      .where(eq(focusDataTable.sessionId, id))
      .orderBy(focusDataTable.timestamp);

    const distractionEvents = focusData
      .filter((d) => d.isDistraction)
      .map((d) => ({
        id: d.id,
        sessionId: d.sessionId,
        startTime: d.timestamp,
        endTime: null,
        duration: null,
        reason: d.gazeDirection ?? "Looked away",
      }));

    const hourlyMap: Record<number, { scores: number[]; distractions: number }> = {};
    for (const dp of focusData) {
      const hour = new Date(dp.timestamp).getHours();
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = { scores: [], distractions: 0 };
      }
      hourlyMap[hour].scores.push(dp.focusScore);
      if (dp.isDistraction) hourlyMap[hour].distractions++;
    }

    const hourlyBreakdown = Object.entries(hourlyMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      avgFocusScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      focusPercentage:
        (data.scores.filter((s) => s >= 60).length / data.scores.length) * 100,
      distractionCount: data.distractions,
    }));

    res.json({ session, focusData, distractionEvents, hourlyBreakdown });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = EndSessionParams.parse(req.params);
    const body = EndSessionBody.parse(req.body);

    const [session] = await db
      .update(sessionsTable)
      .set({
        endTime: new Date(),
        status: "completed",
        avgFocusScore: body.avgFocusScore,
        totalFocusTime: body.totalFocusTime,
        totalDistractionTime: body.totalDistractionTime,
        distractionCount: body.distractionCount,
        focusPercentage: body.focusPercentage,
      })
      .where(eq(sessionsTable.id, id))
      .returning();

    if (!session) {
      return res.status(404).json({ error: "not_found", message: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

export default router;
