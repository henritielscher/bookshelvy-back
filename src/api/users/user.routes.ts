import { Router } from "express";
import { isAuth, validateUser } from "../../middleware";
import { wrapAsync } from "../../utils";
import {
	deleteUser,
	loginUser,
	logoutUser,
	registerUser,
} from "./user.controller";

const router = Router();

router.post("/login", wrapAsync(loginUser));
router.post("/logout", logoutUser);
router.post("/register", validateUser, wrapAsync(registerUser));
router.delete("/delete", isAuth, wrapAsync(deleteUser));

export default router;
