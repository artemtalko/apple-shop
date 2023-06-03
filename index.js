const express = require('express');
const app = express(); 
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 3000;
const db = require('./config/db')
const authRouter = require('./routes/auth');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');


db();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
   console.log(`server is running at port: ${PORT}`);
});