import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sessionsTable, focusDataTable } from "@workspace/db/schema";
import { eq, sql, and, gte, lt, desc } from "drizzle-orm";
import { GetDailyAnalyticsQueryParams, GetFocusTrendsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/daily", async (req, res) => {
  try {
    const query = GetDailyAnalyticsQueryParams.parse(req.query);
    const targetDate = query.date ? new Date(query.date as string) : new Date();
    const dateStr = targetDate.toISOString().split("T")[0];

    const dayStart = new Date(dateStr + "T00:00:00Z");
    const dayEnd = new Date(dateStr + "T23:59:59Z");

    const sessions = await db
      .select()
      .from(sessionsTable)
      .where(and(gte(sessionsTable.startTime, dayStart), lt(sessionsTable.startTime, dayEnd)));

    const focusData = await db
      .select()
      .from(focusDataTable)
      .where(and(gte(focusDataTable.timestamp, dayStart), lt(focusDataTable.timestamp, dayEnd)));

    const totalSessions = sessions.length;
    const scores = focusData.map((d) => d.focusScore);
    const avgFocusScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const totalStudyTime = sessions.reduce(
      (acc, s) => acc + (s.totalFocusTime ?? 0) + (s.totalDistractionTime ?? 0),
      0
    );

    const categoryCount = {
      HIGH_FOCUS: 0,
      MEDIUM_FOCUS: 0,
      LOW_FOCUS: 0,
      DISTRACTED: 0,
    };
    for (const dp of focusData) {
      categoryCount[dp.focusCategory as keyof typeof categoryCount]++;
    }
    const totalPoints = focusData.length || 1;
    const minutesPerPoint = 5 / 60;

    const highFocusMinutes = Math.round(categoryCount.HIGH_FOCUS * minutesPerPoint * 60);
    const mediumFocusMinutes = Math.round(categoryCount.MEDIUM_FOCUS * minutesPerPoint * 60);
    const lowFocusMinutes = Math.round(categoryCount.LOW_FOCUS * minutesPerPoint * 60);
    const distractedMinutes = Math.round(categoryCount.DISTRACTED * minutesPerPoint * 60);

    const focusPercentage =
      ((categoryCount.HIGH_FOCUS + categoryCount.MEDIUM_FOCUS) / totalPoints) * 100;

    const hourlyMap: Record<number, { scores: number[]; distractions: number }> = {};
    for (const dp of focusData) {
      const hour = new Date(dp.timestamp).getHours();
      if (!hourlyMap[hour]) hourlyMap[hour] = { scores: [], distractions: 0 };
      hourlyMap[hour].scores.push(dp.focusScore);
      if (dp.isDistraction) hourlyMap[hour].distractions++;
    }

    const hourlyBreakdown = Object.entries(hourlyMap).map(([hour, data]) => ({
      hour: parseInt(hour),
      avgFocusScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      focusPercentage: (data.scores.filter((s) => s >= 60).length / data.scores.length) * 100,
      distractionCount: data.distractions,
    }));

    const sortedByScore = [...hourlyBreakdown].sort((a, b) => b.avgFocusScore - a.avgFocusScore);
    const mostFocusedHour = sortedByScore[0]?.hour ?? null;
    const leastFocusedHour = sortedByScore[sortedByScore.length - 1]?.hour ?? null;

    res.json({
      date: dateStr,
      totalSessions,
      totalStudyTime,
      avgFocusScore,
      mostFocusedHour,
      leastFocusedHour,
      focusPercentage,
      highFocusMinutes,
      mediumFocusMinutes,
      lowFocusMinutes,
      distractedMinutes,
      hourlyData: hourlyBreakdown.sort((a, b) => a.hour - b.hour),
    });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

router.get("/trends", async (req, res) => {
  try {
    const query = GetFocusTrendsQueryParams.parse(req.query);
    const days = query.days ?? 7;

    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayStart = new Date(dateStr + "T00:00:00Z");
      const dayEnd = new Date(dateStr + "T23:59:59Z");

      const sessions = await db
        .select()
        .from(sessionsTable)
        .where(and(gte(sessionsTable.startTime, dayStart), lt(sessionsTable.startTime, dayEnd)));

      const focusData = await db
        .select()
        .from(focusDataTable)
        .where(and(gte(focusDataTable.timestamp, dayStart), lt(focusDataTable.timestamp, dayEnd)));

      const scores = focusData.map((d) => d.focusScore);
      const avgFocusScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const focusPercentage =
        scores.length > 0
          ? (scores.filter((s) => s >= 60).length / scores.length) * 100
          : 0;

      results.push({
        date: dateStr,
        avgFocusScore,
        focusPercentage,
        totalSessions: sessions.length,
      });
    }

    res.json({ days, data: results });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

export default router;
