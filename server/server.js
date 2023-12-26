const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config({ path: './config.env' })
const app = require('./app')


const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD)

mongoose.connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
}).then((con) => {
    console.log('DB connection successful')
})

// const PORT = process.env.PORT || 5000;
const PORT = 5000
app.listen(PORT, () => {
    console.log('Running on Port: ', PORT)
})

