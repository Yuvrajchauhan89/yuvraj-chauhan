import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sessionsRouter from "./sessions";
import focusRouter from "./focus";
import analyticsRouter from "./analytics";
import iotRouter from "./iot";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/sessions", sessionsRouter);
router.use("/focus", focusRouter);
router.use("/analytics", analyticsRouter);
router.use("/iot", iotRouter);

export default router;
