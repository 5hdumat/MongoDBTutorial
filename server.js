const express = require('express'); // 모듈 불러오기
const app = express(); // 모듈 초기화

const users = [{ name: "Mingyu", age: 29 }]

app.use(express.json())

app.get('/user', function (req, res) {
    return res.send(users);
})

app.post('/user', function (req, res) {
    users.push({ name: req.body.name, age: req.body.age })
    return res.send({ success: true })
})

app.listen('3000', function () {
    console.log('server listening on port 3000');
}); 