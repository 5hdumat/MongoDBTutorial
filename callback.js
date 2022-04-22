const addSum = function (a, b, callback) {
    setTimeout(() => {
        if (typeof a !== 'number' || typeof b !== 'number') {
            return callback('a, b must be numbers')
        }

        return callback(undefined, a + b)
    }, 3000)
}
 
addSum(10, 10, (error, sum) => {
    if (error) {
        return console.log({ error })
    }
    console.log(sum)

    addSum(sum, 15, (error2, sum) => {
        if (error2) {
            return console.log({ error2 })
        }

        console.log(sum)
        
        addSum(sum, 45, (error2, sum) => {
            if (error2) {
                return console.log({ error2 })
            }
    
            console.log(sum)
        })
    })
})