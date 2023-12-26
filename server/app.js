const express = require('express');
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

// 2.MIDDLEWARE
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json());  // middleware - To get data from req body
app.use(express.static(`${__dirname}/public`))


// 3.ROUTES
app.use('/api/v1/tours/', tourRouter)
app.use('/api/v1/users/', userRouter)


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// global error handling middleware
app.use(globalErrorHandler)

module.exports = app;