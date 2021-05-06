const express=require('express');
const app=express();
const env=require('dotenv/config');
const mongoose=require('mongoose');
const cors=require('cors');
const authJwt=require('./helpers/jwt');
const errorHandler=require('./helpers/error-handler');
const products=require('./routers/products');
const users=require('./routers/users');
const orders=require('./routers/orders');
const categories=require('./routers/categories');

const api=process.env.API_URL;

app.use(cors());
app.options('*',cors());

mongoose.connect('mongodb://localhost/eshop')
.then(()=>console.log('Connected to mongodb'))
.catch(()=>console.log('Connected to mongodb'));

app.use(express.json());
app.use(authJwt());
app.use(errorHandler);
app.use('/public/uploads',express.static(__dirname+'/public/uploads'));
app.use(`${api}/products`,products);
app.use(`${api}/users`,users);
app.use(`${api}/orders`,orders);
app.use(`${api}/categories`,categories);

app.listen(3000,()=>
{
    console.log(`Server is running at 3000`);
});