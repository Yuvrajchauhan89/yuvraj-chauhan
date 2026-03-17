import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { iotAlertsTable } from "@workspace/db/schema";
import { SendIotAlertBody } from "@workspace/api-zod";
import { desc } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

let iotDeviceStatus = {
  connected: false,
  deviceId: null as string | null,
  lastSeen: null as Date | null,
  alertsEnabled: true,
};

router.post("/focus-alert", async (req, res) => {
  try {
    const body = SendIotAlertBody.parse(req.body);
    const alertId = crypto.randomUUID();
    const timestamp = new Date();

    const [alert] = await db
      .insert(iotAlertsTable)
      .values({
        alertId,
        sessionId: body.sessionId ?? null,
        alertType: body.alertType,
        focusScore: body.focusScore ?? null,
        message: body.message ?? null,
        deviceId: body.deviceId ?? null,
        delivered: iotDeviceStatus.connected,
        timestamp,
      })
      .returning();

    if (body.deviceId) {
      iotDeviceStatus.connected = true;
      iotDeviceStatus.deviceId = body.deviceId;
      iotDeviceStatus.lastSeen = timestamp;
    }

    const alertTypeMessages: Record<string, string> = {
      DISTRACTION: `Focus alert: User is distracted. Focus score: ${body.focusScore?.toFixed(0) ?? "N/A"}`,
      LOW_FOCUS: `Low focus detected. Focus score: ${body.focusScore?.toFixed(0) ?? "N/A"}`,
      SESSION_START: "Focus session started. Stay focused!",
      SESSION_END: `Session ended. Final focus score: ${body.focusScore?.toFixed(0) ?? "N/A"}`,
    };

    res.json({
      success: true,
      alertId,
      timestamp: timestamp.toISOString(),
      delivered: iotDeviceStatus.connected,
      message: body.message ?? alertTypeMessages[body.alertType] ?? "Alert sent",
    });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: String(err) });
  }
});

router.get("/status", async (req, res) => {
  res.json({
    connected: iotDeviceStatus.connected,
    deviceId: iotDeviceStatus.deviceId,
    lastSeen: iotDeviceStatus.lastSeen?.toISOString() ?? null,
    alertsEnabled: iotDeviceStatus.alertsEnabled,
  });
});

router.post("/register", async (req, res) => {
  const { deviceId } = req.body;
  if (deviceId) {
    iotDeviceStatus.connected = true;
    iotDeviceStatus.deviceId = deviceId;
    iotDeviceStatus.lastSeen = new Date();
  }
  res.json({ success: true, message: "IoT device registered" });
});

export default router;
