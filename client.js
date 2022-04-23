const { default: axios } = require("axios");

console.log("client code running.");

const URI = "http://localhost:3000";

// 비효율적인 방법 (client에서 여러번 network하는 경우):
// blogs limit 10일 때: 3초

// 효율적인 방법 (populate 활용):
// blogs limit 10일 때: 200초
const test = async () => {
    console.time();
    let {
        data: { blogs },
    } = await axios.get(`${URI}/blog`);

    console.dir(blogs, { depth: 10 });
    // Promise.all은 비동기 처리를 병렬적으로 호출하고 싶을 때 사용한다.
    // Promise.all은 Pomise 인자를 배열로 받는다.
    // (axios는 promise를 return 한다.)
    //
    // blogs = await Promise.all(
    //     blogs.map(async (blog) => {
    //         const [user, comment] = await Promise.all([
    //             axios.get(`${URI}/user/${blog.user}`),
    //             await axios.get(`${URI}/blog/${blog._id}/comment`),
    //         ]);

    //         blog.user = user.data.user;
    //         blog.comments = await Promise.all(
    //             comment.data.comment.map(async (data) => {
    //                 const {
    //                     data: { user },
    //                 } = await axios.get(`${URI}/user/${data.user}`);
    //                 data.user = user;
    //                 return comment;
    //             })
    //         );

    //         return blog;
    //     })
    // );

    console.timeEnd();
};

test();
