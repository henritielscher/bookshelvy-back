import BaseJoi from "joi";
import sanitizeHTML from "sanitize-html";

const extension: BaseJoi.ExtensionFactory = (joi) => ({
	type: "string",
	base: joi.string(),
	messages: {
		"string.escapeHTML": "{{#label}} must not include HTML!",
	},
	rules: {
		escapeHTML: {
			validate(value: any, helpers: BaseJoi.CustomHelpers) {
				const clean = sanitizeHTML(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value)
					return helpers.error("string.escapeHTML", { value });
				return clean;
			},
		},
	},
});

const Joi = BaseJoi.extend(extension);

export const bookSchema = Joi.object({
	title: Joi.string().min(3).required().escapeHTML(),
	author: Joi.string().min(3).required().escapeHTML(),
});

export const userSchema = Joi.object({
	email: Joi.string().trim().email().required().escapeHTML(),
	password: Joi.string().trim().required().escapeHTML(),
	username: Joi.string().trim().required().escapeHTML(),
});
