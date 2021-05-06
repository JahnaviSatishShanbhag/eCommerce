const {Order}=require('../models/order');
const express=require('express');
const router=express.Router();
const {OrderItem}=require('../models/order-item');
const { Product } = require('../models/product');

router.get(`/`,async(req,res)=>
{
    const orderList=await Order.find().populate('user','name').sort({'dateOrdered':-1});
    if (!orderList)
    {
        res.status(500).json({
            success:false
        });
    }
    else
    {
        res.status(200).send(orderList);
    }
});

router.get('/:id',async (req,res)=>
{
    const order=await Order.findById(req.params.id)
    .populate('user','name')
    .populate('orderItems');
    // .populate({
    //     path:'orderItems',populate:{
    //         path:'product',populate:'category'
    //     }
    // });
    if (!order)
    {
        return res.status(404).send('Order with the given id is not found');
    }
    res.send(order);
});

router.post(`/`,async (req,res)=>
{
    const orderItemsIds=Promise.all(req.body.orderItems.map(async (orderItem)=>
    {
        let newOrderItem=new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product
        });
        newOrderItem=await newOrderItem.save();
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved=await orderItemsIds;
    const totalPrices=await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>
    {
        const orderItem=await OrderItem.findById(orderItemId).populate('product');
        // console.log(orderItem.product.price);
        const totalPrice=orderItem.product.price*orderItem.quantity;
        return totalPrice;
    }));
    const totalPrice=totalPrices.reduce((a,b)=>a+b,0);
    const order=new Order({
        orderItems:orderItemsIdsResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPrice,
        user:req.body.user
    });
    order.save()
    .then((createdOrder)=>res.status(201).json(createdOrder))
    .catch((err)=>
    {
        res.status(500).json({
            error:err,
            success:false
        });
    });
});

router.put('/:id',async (req,res)=>
{
    const order=await Order.findByIdAndUpdate(
        req.params.id,
        {
            status:req.body.status
        },
        {new:true}
    );
    if (!order)
    {
        return res.status(404).send('The order with the given id is not found');
    }
    res.send(order);
});

router.delete('/:id',async (req,res)=>
{
    Order.findByIdAndRemove(req.params.id)
    .then(async (order)=>
    {
        if (order)
        {
            // order.orderItems.forEach(async (id)=>
            // {
            //     await OrderItem.findByIdAndDelete(id);
            // });
            await order.orderItems.map(async (orderItem)=>
            {
                await OrderItem.findByIdAndRemove(orderItem);
            });
            return res.status(200).json({success:true,message:'The order is deleted successfully'});
        }
        else
        {
            return res.status(404).json({success:false,message:'The order with the given id is not found'});
        }
    })
    .catch((err)=>
    {
        return res.status(500).json({success:false,error:err});
    });
});

// router.get('/get/totalSales',async (req,res)=>
// {
//     const totalSales=await Order
// });

router.get('/get/count',async (req,res)=>
{
    const orderCount=await Order.countDocuments((count)=>count);
    if (!orderCount)
    {
        res.status(500).send({success:false});
    }
    res.send({
        orderCount:orderCount
    })
});

router.get('/get/userorders/:userid',async (req,res)=>
{
    const userOrderList=await Order.find({user:req.params.userid})
    // .populate('user','name')
    // .populate('orderItems');
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'
        }
    })
    .sort({'dateOrdred':-1});
    if (!userOrderList)
    {
        return res.status(404).send('Order with the given id is not found');
    }
    res.send(userOrderList);
});

module.exports=router;