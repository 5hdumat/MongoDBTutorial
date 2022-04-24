const { Router } = require("express");
const commentRouter = Router({
    mergeParams: true,
});
const { Comment, Blog, User } = require("../models");
const { isValidObjectId, startSession } = require("mongoose");

/*
comment는 별도로 생성될 일이 없다. 그러므로
`/comment 보다 /blog/:blogId/comment`로 하는 것이 더 바람직하다.
*/
commentRouter.post("/", async (req, res) => {
    const session = await startSession();
    let comment;
    try {
        // await session.withTransaction(async () => {
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
            // 동시성 이슈로 인해 find에도 트랜잭션 속성을 넣어줘야 한다.
            User.findById(userId, {}, {}),
            Blog.findById(blogId, {}, {}),
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

        comment = new Comment({
            content,
            user,
            userFullName: `${user.name.first} ${user.name.last}`,
            blog: blogId,
        });

        /**
         * Automic updates
         */
        // blog.commentsCount++;
        // blog.comments.push(comment);

        // if (blog.commentsCount > 3) {
        //     blog.comments.shift();
        // }
        // await Promise.all([
        //     comment.save({}),
        //     blog.save(), // blog.save는 위 find 에서 session 객체를 내장했다. 그러므로 또 session을 지정해줄 필요가 X
        //     // Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } }),
        //     // Blog.updateOne({ _id: blogId }, { $push: { comments: comment } }),
        // ]);
        // // });

        /**
         * Automic updates
         */
        await Promise.all([
            comment.save(),
            Blog.updateOne(
                { _id: blogId },
                {
                    $inc: { commentsCount: 1 },
                    $push: { comments: { $each: [comment], $slice: -3 } },
                }
            ),
        ]);

        // 트랜잭션 abort
        // await session.abortTransaction();

        return res.send({ comment });
    } catch (err) {
        return res.status(500).send({ err: err.message });
    } finally {
        // await session.endSession();
    }
});

commentRouter.get("/", async (req, res) => {
    try {
        let { page = 0 } = req.query;
        page = parseInt(page);

        const { blogId } = req.params;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        const comment = await Comment.find({ blog: blogId })
            .sort({ createdAt: -1 })
            .skip(page * 3)
            .limit(3);

        return res.send({ comment });
    } catch (err) {
        return res.status(500).send({ err: err.message });
    }
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
