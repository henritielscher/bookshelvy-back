import { Request, Response } from "express";
import User from "./user.model";
import { CustomSessionData } from "../../types";
import ExpressError from "../../ExpressError";
import * as Service from "./user.service";

export const loginUser = async (req: Request, res: Response) => {
	const session: CustomSessionData = req.session;
	const { email, password } = req.body;

	const user = await Service.findUserByEmail(email);

	if (!user) {
		return res.status(404).json({
			error: "An user with this email address does not exist.",
		});
	}
	const isMatch = await Service.validateUserPassword(password, user.password);
	if (!isMatch) {
		return res
			.status(400)
			.json({ error: "Your email or password was wrong!" });
	}
	session.user = { id: user._id, email: user.email, username: user.username };

	res.status(200).json({
		user: { ...session.user },
		success: `${user.username} successfully logged in.`,
	});
};

export const registerUser = async (req: Request, res: Response) => {
	const { email, password, username } = req.body;
	let user = await Service.findUserByEmail(email);
	if (user) {
		return res.status(400).json({
			error: "A user with that email address does already exist.",
		});
	}

	const newUser = await Service.saveUser(email, password, username);
	res.status(201).json({
		success: `The user with the wmail address ${email} has successfully been created.`,
		userId: newUser?._id,
	});
};

export const logoutUser = (req: Request, res: Response) => {
	const session: CustomSessionData = req.session;

	if (!session.user) {
		return res
			.status(400)
			.json({ error: "There is no current user to logout" });
	}
	session.destroy((err: Error) => {
		if (err) {
			throw new ExpressError("Session Error", 500);
		}
		res.status(200)
			.clearCookie("connect.sid")
			.json({
				success: `${session.user.username} successfully logged out.`,
			});
	});
};

export const deleteUser = async (req: Request, res: Response) => {
	const session: CustomSessionData = req.session;
	const { id, username } = session.user;

	const user = await Service.findUserById(id);
	if (!user) {
		return res.status(400).json({
			error: "This user address does not exist!",
		});
	}

	await Service.deleteUser(id);
	res.status(200).json({ success: `User ${username} has been deleted.` });
};
