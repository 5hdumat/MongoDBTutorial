const { Schema, model, Types } = require("mongoose");
const { CommentSchema } = require("./Comment");
const BlogSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        islive: { type: Boolean, required: true, default: false },
        user: {
            _id: {
                type: Types.ObjectId,
                required: true,
                ref: "user",
            },
            username: { type: String, required: true },
            name: {
                first: { type: String, required: true },
                last: { type: String, required: true },
            },
        },
        commentsCount: { type: Number, default: 0, required: true },
        comments: [CommentSchema],
    },
    { timestamps: true }
);

BlogSchema.index({ "user._id": 1, updatedAt: 1 });
BlogSchema.index({ title: "text", content: "text" });
// BlogSchema.virtual("comments", {
//     ref: "comment",
//     localField: "_id",
//     foreignField: "blog",
// });

// // lazy loading 을 위한 set
// // toJSON이나 toObject가 호출되면 가상필드로 설정해둔 comments가 생성된다.
// BlogSchema.set("toObject", { virtuals: true });
// BlogSchema.set("toJSON", { virtuals: true });

const Blog = model("blog", BlogSchema);

module.exports = {
    Blog,
};
