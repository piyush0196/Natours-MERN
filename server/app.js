const express = require('express');
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes');

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
    // res.status(404).json({status: 'fail', message: `Can't find ${req.originalUrl} on this server`})
    // next()
    const err = new Error(`Can't find ${req.originalUrl} on this server`);
    err.status = 'fail';
    err.statusCode = 404;

    next(err)
})

// global error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status, 
        message: err.message
    })
})

module.exports = app;