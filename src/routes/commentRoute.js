const { Router } = require("express");
const commentRouter = Router({
    mergeParams: true,
});
const { Comment, Blog, User } = require("../models");
const { isValidObjectId } = require("mongoose");
/*
comment는 별도로 생성될 일이 없다. 그러므로

/comment 보다 /blog/:blogId/comment로 하는 것이 더 바람직하다.
*/

commentRouter.post("/", async (req, res) => {
    try {
        const { blogId } = req.params;
        const { content, userId } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "userId is invalid." });
        }

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        if (typeof content !== "string") {
            return res.status(400).send({ err: "content must be a string." });
        }

        const [user, blog] = await Promise.all([
            User.findById(userId),
            Blog.findById(blogId),
        ]);

        if (!user) {
            return res.status(400).send({
                err: "user does not exist.",
            });
        }

        if (!blog) {
            return res.status(400).send({
                err: "blog does not exist.",
            });
        }

        if (!blog.islive) {
            return res.status(400).send({ err: "blog is not avaliable." });
        }

        const comment = new Comment({
            content,
            user,
            userFullName: `${user.name.first} ${user.name.last}`,
            blog,
        });

        await Promise.all([
            comment.save(),
            Blog.updateOne({ _id: blogId }, { $push: { comments: comment } }),
        ]);

        return res.send({ comment });
    } catch (err) {
        return res.status(500).send({ err: err.message });
    }
});

commentRouter.get("/", async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        const comment = await Comment.find({ blog: blogId });
        return res.send({ comment });
    } catch (err) {}
});

commentRouter.patch("/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (typeof content !== "string") {
        return res.status(400).send({ err: "content must be a string." });
    }

    const [comment] = await Promise.all([
        await Comment.findOneAndUpdate(
            { _id: commentId },
            { content },
            { new: true }
        ),
        Blog.updateOne(
            { "comments._id": commentId },
            { "comments.$.content": content }
        ),
    ]);
    return res.send({ comment });
});

commentRouter.delete("/:commentId", async (req, res) => {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndDelete({ _id: commentId });

    // 여러 조건일 경우 ($elenMatch)
    // await Blog.updateOne(
    //     { "comments._id": commentId },
    //     {
    //         $pull: {
    //             comments: { $elenMatch: { _id: commentId, comment: "hello" } },
    //         },
    //     }
    // );

    await Blog.updateOne(
        { "comments._id": commentId },
        { $pull: { comments: { _id: commentId } } },
        { new: true }
    );

    return res.send({ comment });
});

module.exports = {
    commentRouter,
};
