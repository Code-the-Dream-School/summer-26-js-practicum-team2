const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

//pending deletions infor re: all of the pending deletions from all users requesting to delete acct
const getPendingDeletedAccounts = async (req, res, next) =>{
  try{ 
    const pendingDelRequests= await User.find({
  deletion_status: "pending",
  is_deleted: {$in: [true, false] },
}).select("name email deletion_status deletion_requested_at "); //select the fields from the user table
return res.status(StatusCodes.OK).json({
  count: pendingDelRequests,
user: pendingDelRequests,
});
  }catch(err){
   return next(err);
  }
  //approve deletion request
  await User.findByIdAndUpdate(useImperativeHandle, {
    //field that need to return
    deletion_status: "approved"
    deleted_at: new Date(),
    is_deleted: true,
    deletion_approved_by: req.user.id,
    

  })
};

