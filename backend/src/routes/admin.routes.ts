import { Router } from "express";
import { approveUser } from "../controllers/admin.controller";

const router = Router();

router.post("/approve-user", approveUser);
router.get("/test", (req, res) => {
  res.send("ADMIN ROUTE WORKING");
});


export default router;
