const express = require("express"); // 모듈 불러오기
const { default: mongoose } = require("mongoose");
const app = express(); // 모듈 초기화
const { userRouter, blogRouter, commentRouter } = require("./routes");
const { generateFakeData } = require("../faker2");
const MONGO_URI =
    "mongodb+srv://admin:RNAMybeYyVyZM3Am@mongodbtutorial.l6x2w.mongodb.net/BlogService";

const server = async () => {
    try {
        let mongodbConnection = await mongoose.connect(MONGO_URI);
        mongoose.set("debug", true);

        console.log("mongodb connect.");

        app.use(express.json());

        app.use("/user", userRouter);
        app.use("/blog", blogRouter);
        app.use("/blog/:blogId/comment", commentRouter);

        app.listen("3000", async () => {
            console.log("server listening on port 3000");

            // for (let i = 1; i < 20; i++) {
            //     await generateFakeData(3, 5, 20);
            // }
        });
    } catch (err) {
        console.log(err);
    }
};

server();
