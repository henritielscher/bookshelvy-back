import { Cookie } from "express-session";
import mongoose from "mongoose";

export interface CustomSessionData {
	cookie: Cookie;
	[key: string]: any;
}

export interface IUser {
	email: string;
	password: string;
	username: string;
	_id: mongoose.Types.ObjectId;
}

export interface IBook {
	author: string;
	title: string;
	creator: mongoose.Types.ObjectId;
	_id: mongoose.Types.ObjectId;
}
