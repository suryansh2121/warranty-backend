const {verifyToken} = require('../utils/jwt');

const auth = (req, res, next) =>{
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token){
        return res.status(401).json({message: 'No token, authorization denied'});
    }
    try{
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }catch(error){
        res.status(401).json({message: 'Invalid token'})
    }
};

module.exports = auth;