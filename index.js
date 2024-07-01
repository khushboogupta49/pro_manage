// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const app = require('./app');


// dotenv.config({ path: './dotenv.config' });

// console.log(process.env.NODE_ENV);

// process.on('uncaughtException', (err) => {
//   console.log('Uncaught Exception 💥');
//   console.log(err.name);

//   process.exit(1);
// });

// mongoose.connect(process.env.DATABASE)
// .then(() => {
//   console.log(' Connected to database')
// }).catch((err)=>{
//   console.log(err)
  
//   })


// app.listen(3000,()=>{
//   console.log("SERVER IS RUNNING AT PORT 3000")
//   })



// // const server = app.listen(process.env.PORT, () => {
// //   console.log('listening on port ' + process.env.PORT);

// // });

// // process.on('unhandledRejection', (err) => {
// //   console.log('Unhandled Rejection 💥');
// //   console.log(err.name, err.message);

// //   server.close(() => process.exit(1));
// // });


const express = require('express');
const cors = require('cors');
const globalErrorHandler = require('./utils/globalErrorHandler');
const authRouter = require('./routes/authRoute');
const taskRouter = require('./routes/taskRoute');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/AppError');
const morgan = require('morgan');

const bodyParser = require("body-parser")

const app = express();

app.use(morgan('dev'));
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);





app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).send('Welcome to our server');
});

app.get('/api/v1/', (req, res) => {
  return res.status(200).send('Explore the our frontend and backend server.');
});              

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  throw new AppError('Route does not exists', 404);
});    

app.use(globalErrorHandler);

module.exports = app;

















