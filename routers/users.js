const {User}=require('../models/user');
const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

router.get(`/`,async(req,res)=>
{
    const userList=await User.find().select('-passwordHash');
    if (!userList)
    {
        res.status(500).json({
            success:false
        });
    }
    else
    {
        res.status(200).send(userList);
    }
});

router.get('/:id',async(req,res)=>
{
    const user=await User.findById(req.params.id).select('name email phone');
    if (!user)
    {
        return res.status(404).json({message:"The user with the given id cannot be found"});
    }
    res.status(200).send(user);
});

router.post('/login',async(req,res)=>
{
    const user=await User.findOne({email:req.body.email});
    const secret=process.env.secret;
    if (!user)
    {
        return res.status(400).send('User not found');
    }
    if (user && bcrypt.compareSync(req.body.password,user.passwordHash))
    {
        const token=jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin
            },
            secret,
            {expiresIn:'1d'}
        );
        res.status(200).send({user:user.email,token:token});
    }
    else
    {
        res.status(400).send('Password is wrong!');
    }
});

router.post(`/`,async(req,res)=>
{
    const user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        street:req.body.street,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
    });
    await user.save();
    if (!user)
    {
        return res.status(500).send('The user cannot be created');
    }
    res.send(user);
});

router.post(`/register`,async(req,res)=>
{
    const user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        street:req.body.street,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
    });
    await user.save();
    if (!user)
    {
        return res.status(500).send('The user cannot be created');
    }
    res.send(user);
});

router.get('/get/count',async(req,res)=>
{
    const userCount=await User.countDocuments((count)=>count);
    if (!userCount)
    {
        return res.status(500).json({success:false})
    }
    res.send({count:userCount});   
});

module.exports=router;