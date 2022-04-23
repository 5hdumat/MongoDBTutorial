const { Router } = require("express");
const blogRouter = Router();
const { Blog, User } = require("../models");
const { isValidObjectId } = require("mongoose");
const { userRouter } = require("./userRoute");
const { default: mongoose } = require("mongoose");

blogRouter.post("/", async (req, res) => {
    try {
        const { title, content, islive, userId } = req.body;

        if (typeof title !== "string") {
            return res.status(400).send({ err: "title is must be a string." });
        }

        if (typeof content !== "string") {
            return res.status(400).send({ err: "content is must be a string" });
        }

        if (islive && typeof islive !== "boolean") {
            return res
                .status(400)
                .send({ err: "islive is must be a boolean." });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "userId is invalid." });
        }

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ err: "user does not exist." });
        }

        let blog = new Blog({ ...req.body, user });

        await blog.save();
        return res.send({ blog });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

blogRouter.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({});
        // .populate([
        //     { path: "user" },
        //     { path: "comments", populate: [{ path: "user" }] },
        // ]);

        return res.send({ blogs });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

blogRouter.get("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send({ err: "blog does not exist." });
        }

        return res.send({ blog });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

blogRouter.put("/:blogId", async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        const { title, content } = req.body;

        if (typeof title !== "string") {
            return res.status(400).send({ err: "title is must be a string." });
        }

        if (typeof content !== "string") {
            return res.status(400).send({ err: "content is must be a string" });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(400).send({ err: "blog does not exist." });
        }

        if (title) {
            blog.title = title;
        }

        if (content) {
            blog.content = content;
        }

        await blog.save();
        return res.send({ blog });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

blogRouter.patch("/:blogId/live", async (req, res) => {
    try {
        const { blogId } = req.params;

        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ err: "blogId is invalid." });
        }

        const { islive } = req.body;

        if (typeof islive !== "boolean") {
            return res.status(400).send({ err: "islive must be boolean." });
        }

        const blog = await Blog.findByIdAndUpdate(
            blogId,
            { islive },
            { new: true }
        );

        return res.send({ blog });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

module.exports = {
    blogRouter,
};
