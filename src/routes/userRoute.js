const { Router } = require("express");
const userRouter = Router();
const { User, Blog, Comment } = require("../models");
const { isValidObjectId } = require("mongoose");

userRouter.get("/", async (req, res) => {
    try {
        const users = await User.find();
        return res.send({ users });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

userRouter.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "invalid userId" });
        }

        const user = await User.findOne({ _id: userId });
        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

userRouter.post("/", async (req, res) => {
    try {
        let { username, name } = req.body;

        if (!username) {
            return res.status(400).send({ err: "username is required." });
        }

        if (!name || !name.first || !name.last) {
            return res
                .status(400)
                .send({ err: "Both first and last names are required." });
        }

        const user = new User(req.body);
        await user.save();

        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

userRouter.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "invalid userId" });
        }

        const [user] = await Promise.all([
            User.findOneAndDelete({ _id: userId }),
            Blog.deleteMany({ "user._id": userId }),
            Blog.updateMany(
                { "comments.user": userId },
                {
                    $pull: {
                        comments: {
                            user: userId,
                        },
                    },
                }
            ),
            Comment.deleteMany({ user: userId }),
        ]);

        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

userRouter.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ err: "invalid userId" });
        }

        const { age, name } = req.body;

        if (!age && !name) {
            return res.status(400).send({ err: "age or name is required." });
        }

        if (age && typeof age !== "number") {
            return res.status(400).send({ err: "age must be a number." });
        }

        if (
            name &&
            typeof name.first !== "string" &&
            typeof name.last !== "string"
        ) {
            return res
                .status(400)
                .send({ err: "first and last name are must be a string." });
        }

        // mongoose 사용하면 $set 생략 가능
        // const user = await User.findOneAndUpdate(
        //     userId,
        //     { age, name },
        //     { new: true }
        // );
        // return res.send({ user });

        // findOneAndUpdate는 모든 작업이 온전히 mongoDB에서 일어나기 때문에 mongoose에 정의해놓은 스키마를 타지 않는다.(편의 기능을 이용할 수 없다.)
        // 이를 해결하려면 아래와 같이 findOne으로 엔티티를 불러와 직접 수정후 save를 하면된다.
        let user = await User.findById(userId);

        console.log(user);

        if (age) user.age = age;
        if (name) {
            user.name = name;

            await Promise.all([
                Blog.updateMany(
                    { "user._id": userId },
                    { "user.name": user.name }
                ),
                Blog.updateMany(
                    {},
                    {
                        "comments.$[comment].userFullName": `${name.first} ${name.last}`,
                    },
                    { arrayFilters: [{ "comment.user": userId }] }
                ),
            ]);
        }

        await user.save();
        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: err.message });
    }
});

module.exports = {
    userRouter,
};
