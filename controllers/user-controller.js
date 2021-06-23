const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error')
const uuid = require('uuid')

const User = require('../models/User')



const signup = async(req,res,next) =>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data.',422))
    }
    const {name,email,password} = req.body;

     
    let existingUser;
    try {
        existingUser = await User.findOne({email:email})
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',500
        );
        return next(error)
    }
    if(existingUser){
        const error = new HttpError(
            'User exists already, please login instead.',422
        );
        return next(error)
    }
    const createdUser = new User({
        name,
        email,
        image:"https://live",
        password
    })

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing Up failed,Please try again',
            500
        )
        return next(error)
    }

    res.status(201).json({user:createdUser.toObject({getters:true})});
}


module.exports = {
    signup
}
 