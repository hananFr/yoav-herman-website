const users = require('./routes/users');
const auth = require('./routes/auth');
const cards = require('./routes/cards');
const blogs = require('./routes/blogs')
const products = require('./routes/products')
const cors = require('cors');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const path = require('path');
const logger = require('morgan');
const { decode, encode } = require('querystring');




const password = encodeURIComponent("1q2w3e4r5t^Y");


const uri = `mongodb+srv://hananfruman:${password}@server-side.2g18t.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("connected to MongoDB..."))
.catch(err => console.error(err));


app.use(express.urlencoded({extended: false}))
app.use(logger('dev'))
app.use(cors())
app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/cards', cards);
app.use('/api/blogs', blogs);
app.use('/api/products', products);





const port = process.env.port || 3000;
http.listen(port, () => console.log(`Listening on port ${port}...`));

