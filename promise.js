const addSum = (a, b) =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (typeof a !== "number" || typeof b !== "number") {
                reject("a, b must be numbers");
            }

            resolve(a + b);
        }, 1000);
    });

// addSum(1, 2)
//     .then(sum1 => {
//         console.log({ sum1 })
//         return addSum(sum1, 3)
//     })
//     .then(sum2 => {
//         console.log({ sum2 })
//         return addSum(sum2, 3)
//     })
//     .then(sum3 => {
//         console.log({ sum3 })
//         return addSum(sum3, 3)
//     })
//     .then(sum4 => {
//         console.log({ sum4 })
//         return addSum(sum4, 3)
//     })
//     .catch(error =>
//         console.log({ error })
//     )

const totalSum = async () => {
    try {
        let sum = await addSum(10, 12);
        let sum2 = await addSum(sum, 10);
        let sum3 = await addSum(sum2, 10);

        console.log(sum3);
    } catch (err) {
        if (err) {
            console.log(err);
        }
    }
};

totalSum();
