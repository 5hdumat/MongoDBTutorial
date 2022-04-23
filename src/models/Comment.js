const { Schema, model, Types } = require("mongoose");

const CommentSchema = new Schema(
    {
        content: { type: String, required: true },
        user: { type: Types.ObjectId, required: true, ref: "user" },
        userFullName: { type: String, required: true },
        blog: { type: Types.ObjectId, required: true, ref: "blog" },
    },
    {
        timestamps: true,
    }
);

const Comment = model("comment", CommentSchema);

module.exports = { Comment, CommentSchema };
