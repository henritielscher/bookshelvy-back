import { IUser } from "../../types";
import User from "./user.model";
import bcrypt from "bcrypt";

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
	return await User.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
	return await User.findById(id);
};

export const saveUser = async (
	email: string,
	password: string,
	username: string
): Promise<IUser | null> => {
	const hashedPassword = await bcrypt.hash(password, 12);

	const user = new User({ email, username, password: hashedPassword });
	await user.save();
	const newUser = await User.findOne({ email });
	return newUser;
};

export const validateUserPassword = async (
	formPassword: string,
	password: string
): Promise<boolean> => {
	return await bcrypt.compare(formPassword, password);
};

export const deleteUser = async (id: string) =>
	await User.findByIdAndDelete(id);
