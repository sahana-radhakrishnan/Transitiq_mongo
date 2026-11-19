const jwt=require("jsonwebtoken");
module.exports=function verifyToken(req,res,next){
 try{
  const h=req.headers.authorization;
  if(!h||!h.startsWith("Bearer ")) return res.status(401).json({status:"error",message:"Access denied. Token is required."});
  req.user=jwt.verify(h.split(" ")[1],process.env.JWT_SECRET);
  next();
 }catch(e){return res.status(401).json({status:"error",message:"Invalid or expired token"});}
};
