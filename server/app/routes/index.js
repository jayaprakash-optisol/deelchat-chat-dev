const router = require('express').Router();
const authRouter = require('./auth');
const userRouter = require('./user');
const chatroomRouter = require('./chatroom');
const chatrequestRouter = require('./chatrequest');
const isAuthenticated = require('./auth').authUser; //authenticate token

router.use('/user', isAuthenticated, userRouter);
router.use('/chatrooms', isAuthenticated, chatroomRouter);
router.use('/chatrequest', isAuthenticated, chatrequestRouter);

router.use('/usr', userRouter);

module.exports = router;
