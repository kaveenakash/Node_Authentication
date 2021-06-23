const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express();
app.use(bodyParser.urlencoded({extended:false}))

const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');



app.use('/api/user',userRoutes)


app.use((req,res,next) =>{
    const error = new HttpError('could not find this route',404)
    throw error;
})

app.use((error,req,res,next) =>{
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code | 500)
    res.json({message:error.message || 'An unknown error occured'})
})



mongoose
.connect('mongodb+srv://kaveen:kaveen123@cluster0.xdld3.mongodb.net/maxi?retryWrites=true&w=majority',{useUnifiedTopology:true,useCreateIndex:true,useNewUrlParser:true})
.then(() =>{
    console.log('Database Estabilished')
    app.listen(8000,() =>{
        console.log('Server Started ',8000)
    })
})
.catch(err =>{
    console.log(err) 
})