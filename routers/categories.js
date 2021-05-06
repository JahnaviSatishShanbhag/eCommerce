const {Category}=require('../models/category');
const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');

router.get(`/`,async(req,res)=>
{
    const categoryList=await Category.find();
    if (!categoryList)
    {
        res.status(500).json({
            success:false
        });
    }
    else
    {
        res.status(200).send(categoryList);
    }
});

router.get('/:id',async(req,res)=>
{
    const category=await Category.findById(req.params.id);
    if (!category)
    {
        return res.status(400).send('The category with the given id is not found')
    }
    res.send(category);
});

router.post(`/`,async(req,res)=>
{
    const category=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    });
    await category.save();
    // if (!category)
    // {
    //     return res.status(400).send('the category cannot be created');
    // }
    res.send(category);
});

router.put('/:id',async(req,res)=>
{
    if (!mongoose.isValidObjectId(req.params.id))
    {
        return res.status(400).send('Invalid product id');
    }
    const category=await Category.findByIdAndUpdate(req.params.id,
        {
            name:req.params.id,
            icon:req.params.icon,
            color:req.params.color
        },{new:true});
    if (!category)
    {
        return res.status(404).send('The category with the given id is not found')
    }
    res.send(category);
});

router.delete('/:id',(req,res)=>
{
    Category.findByIdAndRemove(req.params.id)
    .then((category)=>
    {
        if (category)
        {
            return res.status(200).json({
                success:true,
                message:'the category is deleted'
            });
        }
        else
        {
            return res.status(404).json({
                success:false,
                message:'the category is not found'
            }); 
        }
    })
    .catch((err)=>
    {
        return res.status(500).json({success:false,error:err});
    });
});

module.exports=router;