import { Router } from "express";
import {  login, signup } from "../controllers/auth.contoller.js";
import { verify } from "../middlewares/auth.middlewares.js";
import { totalcost, user_order } from "../controllers/order.contollers.js";
const router = Router();

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/order").post(verify,user_order)
router.route("/finduser").post(verify,totalcost)

export default router;