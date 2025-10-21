const Joi = require("joi");

const videoSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
  }),
  description: Joi.string().max(500).required().messages({
    "string.empty": "Description is required",
  }),
  duration: Joi.number().positive().optional().messages({
    "number.base": "Duration must be a number",
  }),
  size: Joi.number().positive().optional().messages({
    "number.base": "Size must be a number",
  }),
  category: Joi.string()
    .valid("education", "entertainment", "sports", "music", "news")
    .required()
    .messages({
      "any.only": "Invalid category",
      "string.empty": "Category is required",
    }),
  uploadBy: Joi.string().optional(),

  fileName: Joi.string().optional(),
  filePath: Joi.string().optional(),
});

const updateVideoSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  category: Joi.string(),
  uploadedBy: Joi.string(),
});

module.exports = { videoSchema, updateVideoSchema };
