function errorHandler(err,req,res,next)
{
    if (err.name=='UnauthorizedError')
    {
        res.status(401).json({message:"The user is not authorized"});
    }
    else if (err.name=='ValidationError')
    {
        res.status(401).json({message:err});
    }
    else
    {
        res.status(500).json(err);
    }
    next();
}

module.exports=errorHandler;