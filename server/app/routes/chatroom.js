const router = require('express').Router();
const Chatroom = require('../../model/chatroom');
const Message = require('../../model/message');
const User = require('../../model/user');
const Userroom = require('../../model/userroom');
const _ = require('lodash');
const Document = require('../../model/document');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Chatlog = require('../../model/chatlog');
const Chatrequest = require('../../model/chatrequest');
const moment = require('moment');
var fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const configuration = require('../../../config/configuration');
const config = require('../../model/DB_connection')
const config_SQL = require('../../model/_db') 
const request = require('request');
const rp = require('request-promise');
const path = require('path');
const ChatroomController = require('../controller/chatroom')
const MessageController = require('../controller/message')
const MessageRecord = require('../../model/messageRecord')
var jsonexport = require('jsonexport');
const pdfshift = require('pdfshift')('6c97440cc19d4959b5860c61463a00b2')
const Sync_contact = require('../../model/Sync_contact')
let mysql = require('mysql');
const mkdirp = require('mkdirp');
const socketFile=require('../sockets/index')
const sqlConnection=require('../../model/sqlConnection')
let connection = mysql.createConnection(sqlConnection);
 
var mysqlCon = require('../../model/mySqlAPI');

mysqlCon.reconnect = function () {
  mysqlCon.connect().then(function (con) {
    console.log("connected. getting new reference");
    mysql = con;
    mysql.on('error', function (err, result) {
      mysqlAPI.reconnect();
    });
  }, function (error) {
    console.log("try again");
    setTimeout(mysqlAPI.reconnect, 2000);
  });
};

//Image Storage:
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
var imageStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    let date = moment().format("YYYYDDMM")
    let dir = path.resolve(__dirname,'../../../../../DeelChatFiles/DeelachatThumbnail/' + date);
     // if (!fs.existsSync(dir)) {
    //   fs.mkdir(dir, err => {
    //   })
    // }

    mkdirp(dir, function(err) { 
      if(!err){
        callback(null, path.resolve(__dirname, dir));
      }else{
        callback(err,null);
       }
   });
  },
  filename: function (req, file, callback) {
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
    let orgName = file.originalname.substring(0, file.originalname.indexOf('.'));
    let uploadFileName = moment().format("YYYYDDMM") + '-' + Date.now() + '-' + orgName.split(' ').join('_') + ext;
    callback(null, uploadFileName)
  }
});
var uploadImageFiles = multer({ storage: imageStorage }).array('file', 5);

// // update video thumbnail image
// router.put('/videoThumbnail', (req, res, next) => {
//   uploadImageFiles(req,res,function(err) {
//     let fileLength = Object.keys(req.files).length;
//     if(fileLength > 0){
//       if(err) {
//         let errorMsg;
//         if(err.code == "LIMIT_UNEXPECTED_FILE"){
//           errorMsg = "Maximum limit exceeded";
//         }else{
//           errorMsg = "Error uploading file.";
//         }
//         failureHandler(errorMsg, res);
//       }else{
//         let responseBody = req.body; 
//         _.forEach(req.files, function(file) {
//           Message.findAll({
//             where:{
//               TMESSAGES_Message_ID: req.body.messageId,
//               TMESSAGES_Chat_Room_ID: req.body.roomId
//             },
//             raw: true
//           })
//           .then((messageResp) => {
//             let thumbnailURL =  config.authUrl+"/images/"+ file.filename;
//             if(messageResp.length != 0){
//               Message.update({ TMESSAGES_Thumbnail_Url: thumbnailURL },{
//                 where: {
//                   TMESSAGES_Message_ID: req.body.messageId,
//                   TMESSAGES_Chat_Room_ID: req.body.roomId
//                 }
//               }).then((updatedRes) => {
//                 Document.update({ TDOCUMENTS_Thumbnail_Url: thumbnailURL },{
//                   where: {
//                     TDOCUMENTS_Document_ID: messageResp[0].TMESSAGES_Document_ID
//                   }
//                 }).then((updatedDocRes) => {   
//                   successHandler("Successfully uploaded", res);              
//                 });                
//               });
//             }
//           });
//         })
//       }
//     }else{
//       failureHandler("Image required", res);
//     }
//   });
// });

//video thumbnail for view a image in mobile end
router.put('/videoThumbnail', (req, res, next) => {

  uploadImageFiles(req, res, function (err) {

    let fileLength = Object.keys(req.files).length;
    if (fileLength > 0) {
      if (err) {
        let errorMsg;
        if (err.code == "LIMIT_UNEXPECTED_FILE") {
          errorMsg = "Maximum limit exceeded";
        } else {
          errorMsg = "Error uploading file.";
        }
        failureHandler(errorMsg, res);
      } else {

        let responseBody = req.body;
        _.forEach(req.files, function (file) {
          Message.findAll({
            where: {
              TMESSAGES_Message_ID: req.body.messageId,
              TMESSAGES_Chat_Room_ID: req.body.roomId
            },
            raw: true
          })
            .then((messageResp) => {


              let thumbnailURL = configuration.authUrl + "/thumbnail/" + file.filename;
              if (messageResp.length != 0) {

                Message.update({ TMESSAGES_Thumbnail_Url: thumbnailURL }, {
                  where: {
                    TMESSAGES_Message_ID: req.body.messageId,
                    TMESSAGES_Chat_Room_ID: req.body.roomId
                  }
                }).then((updatedRes) => {
                  // MessageRecord.update({ TMESSAGES_Record_Read_Status: "sent" }, {
                  //   where: {
                  //     TMESSAGES_Record_Chat_Room_ID: req.body.roomId,
                  //     TMESSAGES_Record_Message_ID: req.body.messageId
                  //   },
                  //   raw: true
                  // }).then((res) => { });

                  Document.update({ TDOCUMENTS_Thumbnail_Url: thumbnailURL }, {
                    where: {
                      TDOCUMENTS_Document_ID: messageResp[0].TMESSAGES_Document_ID
                    }
                  }).then((updatedDocRes) => {
                   
                    res.setHeader("statusCode", 200);
                    res.status(200).json({
                      status: "Success",
                      statusCode: 200,
                      Message: "Successfully uploaded",
                      URL: thumbnailURL
                    });

                    Chatroom.findAll({ where: { HCHAT_ROOM_Chat_Room_ID: req.body.roomId, HCHAT_ROOM_Is_Broadcast: true } })
                    .then(chatRoomDetails => {
                      Message.update({ TMESSAGES_Thumbnail_Url: thumbnailURL }, {
                        where: {
                          TMESSAGES_Brodcast_Message_ID: req.body.messageId,
                         }
                      }).then((updatedRes) => {})
                     Message.findAll({where:{TMESSAGES_Brodcast_Message_ID:req.body.messageId,TMESSAGES_Message_ID:!req.body.messageId}}).then(messageResponse=>{
                       _.forEach(JSON.parse(JSON.stringify(messageResponse)),function(document){
                        Document.update({ TDOCUMENTS_Thumbnail_Url: thumbnailURL }, {
                          where: {
                            TDOCUMENTS_Document_ID: document.TMESSAGES_Document_ID
                          }
                        }).then((updatedDocRes) => {})
                       })
                     })
                    })
                  });
                });
              } else {
                failureHandler("Room and Message id doesn't match", res);

              }
            });
        })
      }
    } else {
      failureHandler("Image required", res);
    }
  });
});
router.post('/uploadGroupImageAws', (req, res, next) => {
  Chatroom.update({ HCHAT_ROOM_Chat_Room_image: configuration.data.AWS_cloud_front + req.body.filename, }, {
    where: {
      HCHAT_ROOM_Chat_Room_ID: req.body.chatRoomId
    },
    raw: true

  }).then(response => {
    res.setHeader("statusCode", 200);
    res.status(200).json({
      status: "Success",
      statusCode: 200,
      Message: "group icon updated",
      img: configuration.data.AWS_cloud_front + req.body.filename
    });
  }).catch(e=>{
    console.log(e)
    failureHandler(e, res);
  })
  
})
router.post('/uploadGroupImage', (req, res, next) => {
  uploadImageFiles(req, res, function (err) {
    if (err) {
      console.log(err)
    }
    let fileLength
    fileLength = Object.keys(req.files).length;
    let filesArray = [];

    if (fileLength > 0) {
      if (err) {
        let errorMsg;
        if (err.code == "LIMIT_UNEXPECTED_FILE") {
          errorMsg = "Maximum limit exceeded";
        } else {
          errorMsg = "Error uploading file.";
        }
        res.setHeader("statusCode", 400);
        res.status(400).json({
          status: "Failed",
          statusCode: 400,
          data: errorMsg
        });
      } else {
        _.forEach(req.files, function (file) {
          Chatroom.update({ HCHAT_ROOM_Chat_Room_image: configuration.authUrl + "/thumbnail/" + file.filename }, {
            where: {
              HCHAT_ROOM_Chat_Room_ID: req.body.chatRoomId
            },
            raw: true

          }).then(response => {
             
            res.setHeader("statusCode", 200);
            res.status(200).json({
              status: "Success",
              statusCode: 200,
              Message: "group icon updated",
              img: configuration.authUrl + "/thumbnail/" + file.filename
            });
          })
        });
      }
    } else {
      res.setHeader("statusCode", 400);
      res.status(400).json({
        status: "Failed",
        statusCode: 400,
        data: "Image required"
      })
    }
  });
})
// create room while sync
router.post('/sync_contacts', (req, res, next) => {
  //body users: {},

  let x = 0
  let count = 0
  var startLoop = function (arr) {

    callFunction(arr[x], function () {
      count++
      x++;
      if (x < arr.length) {
        startLoop(arr);
      }

    });

  }
  startLoop(req.body.users)
  successMessageHandler("Successfully updated", res);


});
//function call for update contact
function callFunction(user, callback) {
  let data = {
    room1: user.userId + "&" + user.appUser,
    room2: user.appUser + "&" + user.userId
  }
  Chatroom.findAll({
    where: {
      [Op.or]: [{ HCHAT_ROOM_Name: data.room1 }, { HCHAT_ROOM_Name: data.room2 }]
    },
    raw: true
  })
    .then((foundRoom) => {
      let roomUsers=[]
      roomUsers.push(user.userId)
      roomUsers.push(user.appUser)
      if (foundRoom.length == 0) {
        Chatroom.create({ HCHAT_ROOM_Name: data.room1 })
          .then((createdRoom) => {
            let roomId = createdRoom.toJSON().HCHAT_ROOM_Chat_Room_ID
             Sync_contact.update({ chatRoomId: roomId }, {
              where: { userId: user.userId, appUser: user.appUser },
              raw: true

            }).then(res => {
              callback()
              addUserToUserRoom(roomUsers)
            })
          });
      } else {
        let roomId = foundRoom[0].HCHAT_ROOM_Chat_Room_ID;
          Sync_contact.update({ chatRoomId: roomId }, {
            where: {
              userId: user.userId,
              appUser: user.appUser
            },
            raw: true
          }).then((updatedRes) => {
             callback()
             addUserToUserRoom(roomUsers)

            });

      }
    })
}

// update user active/inactive in private room
router.put('/updateActive', (req, res, next) => {

  Userroom.findAll({
    where: {
      DUSER_ROOM_UID: req.body.userId,
      DUSER_ROOM_Chat_Room_ID: req.body.roomId
    },
    raw: true
  })
    .then((userRoom) => {
      if (userRoom.length != 0) {
        Userroom.update({ DUSER_ROOM_Active: req.body.active }, {
          where: {
            DUSER_ROOM_UID: req.body.userId,
            DUSER_ROOM_Chat_Room_ID: req.body.roomId
          }
        })
          .then((updatedRes) => {
            successMessageHandler("Successfully updated", res);
          });
      } else {
        failureHandler("Record Not found", res);
      }
    }).catch(next);
});

//update user archive history
router.put('/updateArchive', (req, res, next) => {

  Userroom.update({ DUSER_ROOM_Archive: req.body.isArchive }, {
    where: {
      DUSER_ROOM_UID: req.body.userId,
      DUSER_ROOM_Chat_Room_ID: req.body.roomId
    }
  }).then({})
  Chatlog.update({ TChat_Log_IS_Archive: req.body.isArchive }, {
    where: {
      TChat_Log_Sender: req.body.userId,
      TChat_Log_Chat_Room_ID: req.body.roomId
    }
  })
    .then((updatedRes) => {
      if(req.body.isArchive==1){
        successMessageHandler("chat conversation successfully Archived ", res);

      }else{
        successMessageHandler("chat conversation successfully Un-Archived ", res);

      }
    });
});
router.put('/ArchiveAll', (req, res, next) => {

  Userroom.update({ DUSER_ROOM_Archive: false }, {
    where: {
      DUSER_ROOM_UID: req.body.userId,
      // DUSER_ROOM_Chat_Room_ID: req.body.roomId
    }
  }).then({})
  Chatlog.update({ TChat_Log_IS_Archive: true }, {
    where: {
      TChat_Log_Sender: req.body.userId,
      // TChat_Log_Chat_Room_ID: req.body.roomId
    }
  })
    .then((updatedRes) => {
       res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg: "All conversation has been archived successfully"
      });
    });
});

// list out archive
router.get('/ListArchive', (req, res, next) => {
  Chatlog.findAll({
    where: {
      TChat_Log_Sender: req.query.userId,
      TChat_Log_IS_Archive: true
    },
    include: [
      { model: User, as: 'senderUser', attributes: ['DN_ID', 'DC_USERNAME', 'DC_USER_IMAGE',] },
      { model: User, as: 'receiverUser', attributes: ['DN_ID', 'DC_USERNAME', 'DC_USER_IMAGE',] },
      {
        model: Chatroom, as: 'chatRoomLogs', attributes: ['HCHAT_ROOM_Chat_Room_ID', 'HCHAT_ROOM_Name', 'HCHAT_ROOM_IS_Group', 'HCHAT_ROOM_IS_Delete', 'HCHAT_ROOMS_Created_On', "HCHAT_ROOMS_Updated_On", 'HCHAT_ROOMS_Message_ID'],
        include: [
          {
            model: Userroom, as: 'chatRoomData',
            include: [{ model: User, as: 'userRoomData', attributes: ['DN_ID', 'DC_USERNAME', 'DC_USER_IMAGE',] }]
          }]
      }
    ],
  })
    .then((updatedRes) => {
      successHandler(updatedRes, res);
    });
});

//make admin systamatic 
router.put('/makeAdmin', (req, res, next) => {
  Userroom.update({ DUSER_ROOM_Role: "Admin" }, {
    where: {
      DUSER_ROOM_UID: req.body.userId,
      DUSER_ROOM_Chat_Room_ID: req.body.roomId
    }
  })
    .then((updatedRes) => {
      if (updatedRes[0] == 0) {
        successMessageHandler("Aleardy Admin", res);

      } else {
        successMessageHandler("Successfully updated", res);

      }
    });
});

//add group Description for group chat 
router.put('/updateGroupDetails', (req, res, next) => {
  // HCHAT_ROOM_Description
  // HCHAT_ROOM_Name
  Chatroom.update(req.body, {
    where: {
      HCHAT_ROOM_Chat_Room_ID: req.query.roomId,
    },
    raw: true
  })
    .then((updatedRes) => {
      successMessageHandler("Successfully updated", res);
    });
});

//Get room Images/Documents

router.get('/document', (req, res, next) => {
  let roomId = req.query.roomId;
  let limit = parseInt(req.query.limit);
  let offset = 0;
  MessageRecord.findAll({
    where: {
      TMESSAGES_Record_UID: req.query.userId,
      TMESSAGES_Record_Chat_Room_ID: roomId,
      TMESSAGES_Record_IS_Delete: false
    },

    include: [{
      model: Message,
      as: 'roomMessages',
      attributes: ['TMESSAGES_Document_ID'],
    }],

  }).then(roomData => {
     let roomMessages = JSON.parse(JSON.stringify(roomData))
    let documentArray = []

if(roomMessages.length>0&&roomData){

  _.forEach(roomMessages, data => {
    if (data.roomMessages.TMESSAGES_Document_ID != null) {
      documentArray.push(data.roomMessages.TMESSAGES_Document_ID)
    }
  })
  let page = parseInt(req.query.page);
  offset = limit * (page - 1);
     Document.findAndCountAll({
        where: {
          TDOCUMENTS_Chat_Room_ID: roomId,
          TDOCUMENTS_Document_Type: req.query.type,
          TDOCUMENTS_IS_Delete: false,
          TDOCUMENTS_Document_ID: documentArray

        },

        attributes: ['TDOCUMENTS_Document_ID', "TDOCUMENTS_Chat_Room_ID", 'TDOCUMENTS_Document_Type', 'TDOCUMENTS_Document_Name', 'TDOCUMENTS_Created_On', 'TDOCUMENTS_Document_Path', 'TDOCUMENTS_Thumbnail_Url', 'TDOCUMENTS_IS_Delete'],
        order: [
          ['TDOCUMENTS_Created_On', 'DESC'],
        ],
        limit: limit,
        offset: offset
      })
      .then((foundMessages) => {
        // if(foundMessage){}
        let pages = Math.ceil(foundMessages.count / limit);
        
          let filterArr = foundMessages;
          let filterArrData = JSON.parse(JSON.stringify(filterArr)).rows;
 if(filterArrData.length>0){
  let itemsProcessed = 0;
          for (var i = 0; i < filterArrData.length; i++) {
            itemsProcessed++;
            let list = filterArrData[i];
            if (list.TDOCUMENTS_Document_Type == "PDF") {
              if (list.TDOCUMENTS_Document_Name != undefined && list.TDOCUMENTS_Document_Name != null) {


                let splitName = list.TDOCUMENTS_Document_Name.split('-')[1];
                if (splitName != undefined) {
                  list.TDOCUMENTS_Document_Name = splitName;
                } else {
                  list.TDOCUMENTS_Document_Name = list.TDOCUMENTS_Document_Name;
                }
              }
            }
            if (itemsProcessed === filterArrData.length) {

              res.setHeader("statusCode", 200);
              res.status(200).json({
                status: "Success",
                statusCode: 200,
                count: JSON.parse(JSON.stringify(foundMessages)).count,
                pages: pages,
                data: filterArrData,
              
              });
            }
          };
        
}else{
  failureRedponse(req,res)
}        
        // });
      })
      .catch(next);
    }else{
         failureRedponse(req,res)
     }
  }) .catch(next);
  
});

function failureRedponse(req,res){
  res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          data: [],
          count: 0,
          pages: 0
        });
}
router.get('/documents', (req, res, next) => {
  let roomId = req.query.roomId;
  let limit = parseInt(req.query.limit);
  let offset = 0;
  Document.findAndCountAll({
    where: {
      TDOCUMENTS_Chat_Room_ID: roomId,
      TDOCUMENTS_Document_Type: req.query.type,
      TDOCUMENTS_IS_Delete: false
    }
  })
    .then((data) => {
      let page = parseInt(req.query.page);
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      Document.findAll({
        where: {
          TDOCUMENTS_Chat_Room_ID: roomId,
          TDOCUMENTS_Document_Type: req.query.type,
          TDOCUMENTS_IS_Delete: false
        },

        attributes: ['TDOCUMENTS_Document_ID', 'TDOCUMENTS_Document_Type', 'TDOCUMENTS_Document_Name', 'TDOCUMENTS_Created_On', 'TDOCUMENTS_Document_Path', 'TDOCUMENTS_Thumbnail_Url', 'TDOCUMENTS_IS_Delete'],
        order: [
          ['TDOCUMENTS_Created_On', 'DESC'],
        ],
        limit: limit,
        offset: offset
      })
        .then((foundMessages) => {

          if (foundMessages.length == 0) {
            res.setHeader("statusCode", 200);
            res.status(200).json({
              status: "Success",
              statusCode: 200,
              data: foundMessages,
              count: data.count,
              pages: pages
            });
          } else {
            let filterArr = foundMessages;
            let filterArrData = JSON.parse(JSON.stringify(filterArr));
            let itemsProcessed = 0;
            for (var i = 0; i < filterArrData.length; i++) {
              itemsProcessed++;
              let list = filterArrData[i];
              if (list.TDOCUMENTS_Document_Type == "PDF") {
                if (list.TDOCUMENTS_Document_Name != undefined && list.TDOCUMENTS_Document_Name != null) {


                  let splitName = list.TDOCUMENTS_Document_Name.split('-')[1];
                  if (splitName != undefined) {
                    list.TDOCUMENTS_Document_Name = splitName;
                  } else {
                    list.TDOCUMENTS_Document_Name = list.TDOCUMENTS_Document_Name;
                  }
                }
              }
              if (itemsProcessed === filterArrData.length) {
                res.setHeader("statusCode", 200);
                res.status(200).json({
                  status: "Success",
                  statusCode: 200,
                  data: filterArrData,
                  count: data.count,
                  pages: pages
                });
              }
            };
          }
        });
    })
    .catch(next);
});

// update room name
router.put('/updategroup', (req, res, next) => {
  Chatroom.findAll({
    where: {
      HCHAT_ROOM_Name: req.body.groupName
    },
    raw: true
  })
    .then((foundChatrooms) => {
      if (foundChatrooms.length == 0) {
        Chatroom.update({ HCHAT_ROOM_Name: req.body.groupName }, {
          where: { HCHAT_ROOM_Chat_Room_ID: req.body.roomId }
        }).then((updatedRes) => {
            if (updatedRes[0] == 0) {
              successMessageHandler("No changes found", res);

            } else {
              successMessageHandler("Successfully updated", res);

            }
          });
      } else {
        successHandler("Group name already exists", res);
      }
    }).catch(next);
});


// particular log details for enter from notification

router.get('/room_log', (req, res, next) => {

   let input = req.query;
   let UseriD = req.query.userId
  let searchQuery=req.query.search||""
  let limit = req.query.limit || 10
  let pageNumber = req.query.page || 1
  let offset = limit * (pageNumber - 1)
  if (req.query.search != undefined && req.query.search) {
    searchQuery = `'${req.query.search}'`
  } else {
    searchQuery = '""'
  }
 UseriD=`"${UseriD}"`
 let setQuery=`CALL my_logs(${limit},${offset},${searchQuery},${UseriD},${false},${false})`
 config.raw([setQuery]).then((response) => {
  if(response){
   var finalObject = JSON.parse(JSON.stringify(response[0]));

   let logObject=_.filter(finalObject[1],function(logOBj){
return logOBj.TChat_Log_Chat_Room_ID==input.roomId
   })
   if(logObject.length>0){
    res.setHeader("statusCode", 200);
   res.status(200).json({
     status: "Success",
     statusCode: 200,
     data: logObject[0]
   });
  }else{
    res.setHeader("statusCode", 200);
   res.status(200).json({
     status: "Success",
     statusCode: 200,
     data: logObject[0]
   });
  }
  }})
 
  })

//delete All and private 
router.delete('/deleteAll', (req, res, next) => {

  let input = req.body;
 Chatlog.findAll({
    order: [['TChat_Log_Updated_On', 'DESC']],
    where: {
      TChat_Log_Sender:input.userId,
       TChat_Log_IS_Delete: false,
       TChat_Log_Is_User_Delete:false
        },
    include: [
      { model: Chatroom, as: 'chatRoomLogs', attributes: [ 'HCHAT_ROOM_Name', 'HCHAT_ROOM_IS_Group'],
    
      },
    ],

  })
    .then((userData) => {
      var logs = JSON.parse(JSON.stringify(userData));
      if(logs.length>0){
        clearAllChat(input,req,res,next)

 return _.forEach(logs,function(logData){
if (logData.chatRoomLogs.HCHAT_ROOM_IS_Group == 1 || logData.chatRoomLogs.HCHAT_ROOM_IS_Group ==true) {
  let exitdata = {
    groupname: "roomName",
    userId:input.userId,
    chatRoomId: logData.TChat_Log_Chat_Room_ID,
    user: { "userId": input.userId},
    leftType: "left",
  };
  // ChatroomController.exitGroupChatRoom(exitdata, function (err, response) {    })
    // Chatlog.update({  TChat_Log_IS_Delete: true,
    //   TChat_Log_Is_User_Delete: true,TChat_Log_Is_userLeft:true}, {
    //   where: {
    //     TChat_Log_Chat_Room_ID:logData.TChat_Log_Chat_Room_ID, TChat_Log_Sender: input.userId,
    //   },
    //   raw: true
    // }).then((resp) => {})
    
}else{

  Chatlog.update({  TChat_Log_Is_User_Delete: true}, {
    where: {
    TChat_Log_Sender: input.userId,
   TChat_Log_Chat_Room_ID:logData.TChat_Log_Chat_Room_ID
    },
    raw: true
  }).then((resp) => {})
}


       })
       
      }else{
        res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          msg: "Chats has been deleted successfully"
        });
      }

    }).then(result=>{
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg: "Chats has been deleted successfully"
      });
    })
  

});
router.delete('/deletegroup', (req, res, next) => {
  let input = req.body;
  let rooms=[]
  

 _.forEach(input.roomArray, function (roomObj) {
   rooms.push(roomObj.roomId)

// condition.loopCount++

if(roomObj.isGroup==1){
   deteteGroup(input,roomObj.roomId, res)
}else{
   deleteRoom(input,roomObj.roomId, res)
}

 })

 Chatlog.update({TChat_Log_Is_User_Delete: true}, {
  where: {
    TChat_Log_Chat_Room_ID: rooms,
    TChat_Log_Sender:input.senderUser
  },
  raw: true
}).then((resp) => {
  res.setHeader("statusCode", 200);
  res.status(200).json({
    status: "Success",
    statusCode: 200,
    data: "Chats has been deleted successfully",
    msg: "Chats has been deleted successfully"
  
  });
  
})
 

});

//delete group
function deteteGroup(input,roomid, res) {
  input.roomId=roomid
  let exitdata = {
    groupname: "roomName",
    userId: input.senderUser,
    chatRoomId: input.roomId,
    user: {
      "userId": input.senderUser
    },
    leftType: "left",
  };

  Chatroom.findAll({
      where: {
        HCHAT_ROOM_Created_By: exitdata.userId,
        HCHAT_ROOM_Chat_Room_ID: exitdata.chatRoomId,
        HCHAT_ROOM_Is_Broadcast: false,
        HCHAT_ROOM_IS_Group: true
      },
      raw: true
    })
    .then((foundRoom) => {
      if (foundRoom.length != 0) {
        exitdata.groupname = foundRoom[0].HCHAT_ROOM_Name
        Chatlog.update({
          TChat_Log_IS_Delete: true,
          TChat_Log_Is_User_Delete: true,
          TChat_Log_Is_userLeft: true
        }, {
          where: {
            TChat_Log_Chat_Room_ID: input.roomId,
            TChat_Log_Sender: input.senderUser
          },
          raw: true
        }).then((resp) => {
          MessageRecord.update({
            TMESSAGES_Record_IS_Delete: true
          }, {
            where: {
              TMESSAGES_Record_Chat_Room_ID: input.roomId,
              TMESSAGES_Record_UID: input.senderUser
            },
            raw: true
          }).then(response => {})
        })

        ChatroomController.notifyUser(exitdata, "onlineMember", function (err, resp) {})
      }
    })
  ChatroomController.exitGroupChatRoom(exitdata, function (err, response) {})
  Chatlog.update({
    TChat_Log_IS_Delete: true,
    TChat_Log_Is_User_Delete: true,
    TChat_Log_Is_userLeft: true
  }, {
    where: {
      TChat_Log_Chat_Room_ID: input.roomId,
      TChat_Log_Sender: input.senderUser,
    },
    raw: true
  }).then((resp) => {
    MessageRecord.update({
      TMESSAGES_Record_IS_Delete: true
    }, {
      where: {
        TMESSAGES_Record_Chat_Room_ID: input.roomId,
        TMESSAGES_Record_UID: input.senderUser,
      },
      raw: true
    }).then(response => {
    });
  })
}
//delete my room
function deleteRoom(input,roomid, res) {
  input.roomId=roomid

  Chatlog.update({
    TChat_Log_Is_User_Delete: true
  }, {
    where: {

      TChat_Log_Chat_Room_ID: input.roomId,
      TChat_Log_Sender: input.senderUser,
    },
    raw: true
  }).then((resp) => {
    MessageRecord.update({
      TMESSAGES_Record_IS_Delete: true
    }, {
      where: {
        TMESSAGES_Record_Chat_Room_ID: input.roomId,
        TMESSAGES_Record_UID: input.senderUser,
      },
      raw: true
    }).then(response => {
      
    });

    
  })
}
//delete Group and private 
router.get('/deletegroup', (req, res, next) => {
  let input = req.query;
  if (input.isGroup == 1 || input.isGroup == true || input.isGroup == "true") {
    let exitdata = {
      groupname: "roomName",
      userId:input.senderUser,
      chatRoomId: input.roomId,
      user: { "userId": input.senderUser},
      leftType: "left",
    };
   
    Chatroom.findAll({
      where: {
        HCHAT_ROOM_Created_By:exitdata.userId,
        HCHAT_ROOM_Chat_Room_ID:exitdata.chatRoomId,
        HCHAT_ROOM_Is_Broadcast:false,
        HCHAT_ROOM_IS_Group:true
      },
      raw: true
  })
      .then((foundRoom) => {
           if (foundRoom.length != 0) {
exitdata.groupname=foundRoom[0].HCHAT_ROOM_Name
      Chatlog.update({ TChat_Log_IS_Delete:true, TChat_Log_Is_User_Delete: true,TChat_Log_Is_userLeft:true}, {
        where: {
          TChat_Log_Chat_Room_ID: input.roomId,
          TChat_Log_Sender:input.senderUser
        },
        raw: true
      }).then((resp) => {
        MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
          where: {
            TMESSAGES_Record_Chat_Room_ID: input.roomId,
            TMESSAGES_Record_UID:input.senderUser
          },
          raw: true
        }).then(response => {
        })
      })

      ChatroomController.notifyUser(exitdata,"onlineMember", function (err, resp) {
      })
           }
        })
    ChatroomController.exitGroupChatRoom(exitdata, function (err, response) {    })
 //TChat_Log_IS_Delete:true for delete group and it won't add again if group user start chart 
 
      Chatlog.update({ TChat_Log_IS_Delete:true, TChat_Log_Is_User_Delete: true,TChat_Log_Is_userLeft:true}, {
        where: {
          TChat_Log_Chat_Room_ID: input.roomId,
           TChat_Log_Sender: input.senderUser,
        },
        raw: true
      }).then((resp) => {
        MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
          where: {
            TMESSAGES_Record_Chat_Room_ID: input.roomId,
             TMESSAGES_Record_UID: input.senderUser,
          },
          raw: true
        }).then(response => {
          res.setHeader("statusCode", 200);
          res.status(200).json({
            status: "Success",
            statusCode: 200,
            data: "Group has been deleted successfully",
            msg: "Group has been deleted successfully"

          });
        });
      })
    
 

  }else{
    Chatlog.update({ TChat_Log_Is_User_Delete: true}, {
      where: {
      
        TChat_Log_Chat_Room_ID: input.roomId, TChat_Log_Sender: input.senderUser,
      },
      raw: true
    }).then((resp) => {
      MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
        where: {
          TMESSAGES_Record_Chat_Room_ID: input.roomId, TMESSAGES_Record_UID: input.senderUser,
        },
        raw: true
      }).then(response => {
        res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          data: "Chats has been deleted successfully",
          msg: "Chats has been deleted successfully"

        });
      });
    })
  
  }
  

});

//delete message
router.delete('/deleteMessage', (req, res, next) => {
  let input = req.body;
if(input.deleteForEveryOne){
  MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
    where: {
        TMESSAGES_Record_UID: input.userId,
      TMESSAGES_Record_Message_ID: { $in: input.messageId }

    },
    raw: true

  }).then((resp) => {
    if (resp[0] != 0) {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: "Successfully deleted",
        msg: "Successfully deleted"

      });
    } else {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: "No Record Fond!!!",
        msg: "No Record Fond!!!"

      });
    }

  });
}else{
  MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
    where: {
      TMESSAGES_Record_Chat_Room_ID: input.roomId, TMESSAGES_Record_UID: input.userId,
      TMESSAGES_Record_Message_ID: { $in: input.messageId }

    },
    raw: true
   
  }).then((resp) => {
    if (resp[0] != 0) {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: "Successfully deleted",
        msg: "Successfully deleted"

      });
    } else {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        data: "No Record Fond!!!",
        msg: "No Record Fond!!!"

      });
    }

  });
}
  
});

// router.get('/getReadInfo', (req, res, next) => {
//   let input = req.query;
//    console.log(input)
//    if(input.chatRoomId&&input.messageId&&input.userId){
//     let query=` SELECT 
//     DISTINCT   REC.TMESSAGES_Record_UID,
//     SCON.name,
//     RUSERS.DN_PHONE,
  
//     RUSERS.DC_USER_IMAGE,
//     REC.TMESSAGES_Record_Read_Status,
//     REC.TMESSAGES_Record_Updated_On
//     FROM deelchatdev.CON_T_Messages_Records as REC
 
//     LEFT JOIN deelchatdev.tbl_cu_chatusers RUSERS ON REC.TMESSAGES_Record_UID = RUSERS.DN_ID
//      LEFT JOIN deelchatdev.tbl_cu_sync_contacts SCON ON  REC.TMESSAGES_Record_UID= SCON.appUser AND  SCON.userId = "${input.userId}"
//      where 
//    TMESSAGES_Record_Chat_Room_ID=${input.chatRoomId} and
//        TMESSAGES_Record_Message_ID= ${input.messageId} and not
//        TMESSAGES_Record_UID="${input.userId}";`
//        config.raw([query]).then((response,err) => {
//         if(err){
//           res.setHeader("statusCode", 200);
//           res.status(200).json({
//             status: "Success",
//             statusCode: 200,
//             err
//            });
//          }else{
//            response=JSON.parse(JSON.stringify(response[0]))
//           let Read=[]
//            let Sent=[]
//            let Delivered=[]
//            response.forEach(element => {
//             if(element.TMESSAGES_Record_Read_Status==="Delivered"){
//               Delivered.push(element)
//             }else if(element.TMESSAGES_Record_Read_Status==="Read"){
//               Read.push(element)
//             }else{
//               Sent.push(element)
//             }
//            });
//           res.setHeader("statusCode", 200);
//           res.status(200).json({
//             status: "Success",
//             statusCode: 200,
//              response:{Read,Delivered,Sent}
//           });
//          }
         
//        })
//    }else{
//     res.setHeader("statusCode", 200);
//     res.status(200).json({
//       status: "Success",
//       statusCode: 200,
//       msg:"please enter valid data"
//     });
//    }
   

// });


//clear chat history
router.put('/clearChat', (req, res, next) => {
  let input = req.body;
  MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
    where: {
      TMESSAGES_Record_Chat_Room_ID: input.roomId, TMESSAGES_Record_UID: input.userId,
    },
    raw: true
  }).then((resp) => {
    if (resp[0] != 0) {
      Chatlog.update({ TChat_Log_Message_ID: null }, {
        where: { TChat_Log_Chat_Room_ID: input.roomId,
        TChat_Log_Sender: input.userId }
    }).then(res => { })
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg: "Successfully cleared"
      });
    } else {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg: "No Record Fond!!!"
      });
    }
  });
});

//clear all chat history
router.put('/clearAllChat', (req, res, next) => {
  clearAllChat(req.body,req,res,next)
  res.setHeader("statusCode", 200);
  res.status(200).json({
    status: "Success",
    statusCode: 200,
    msg: "All chat history has been cleard!"
  });
});

router.post('/send_message', (req, res, next) => {
  let room = req.body.senderId + "&" + req.body.receiverId;
    let senderId=req.body.senderId 
    let receiverId=req.body.receiverId 
  let room1 =senderId+ "&" + receiverId;
  let room2 = receiverId+ "&" +senderId;
  let roomUsersArr=[]
  let buxMessage=req.body.buxMessage||"Bux"
  ChatroomController.createChatRoom({ room: room, room1: room1, room2: room2 }, function (err, completeRoomCreation) {
    roomUsersArr.push(senderId);
    roomUsersArr.push(receiverId);
    let roomId={chatRoomId:completeRoomCreation[0].HCHAT_ROOM_Chat_Room_ID}
  ChatroomController.createUserRoom({  data:roomId,roomUsers: roomUsersArr,roomUsersArr,chatRoomId:roomId.chatRoomId }, function (err, joinedRoomResp) { });

     let data = {
      roomname: completeRoomCreation[0].HCHAT_ROOM_Name,
       msg: buxMessage,
      // hasMsg: data.hasMsg,
      hasFile:false,
       isGroup:false,
      userId: senderId,
      chatRoomId:completeRoomCreation[0].HCHAT_ROOM_Chat_Room_ID,
      istype: "text",
      isForward: false,
      // dazzId: data.dazzId,//"8664e761-a35a-4b11-9229-81f29bdfb32c",
      // contact_name: data.contact_name,
      // contact_number: data.contact_number,
      // lat: data.lat,
      // long: data.long,
      // nynm: data.nynm,
      // nynm_short: data.nynm_short,
      // buxs: data.buxs
  }
  let userStatus = { status: "Offline", online: false, userId: req.body.senderId }
/*  if(socketFile.createMessage != null){
    socketFile.createMessage(data, function(err, msg) {
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg:msg.msgResponse
      });
    })
  } else {
    res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Faild",
        statusCode: 200,
        msg:'Something wrong...'
      });
  }*/
  
    MessageController.createdMessage(userStatus, data, function (err, msgResponse) {
       let obj={
          msgResponse: msgResponse,
         data:data
       }
        socketFile.foo()
      res.setHeader("statusCode", 200);
    res.status(200).json({
      status: "Success",
      statusCode: 200,
      msg:msgResponse
    });
    })
 
  })
   
});


router.put('/mute_chat', (req, res, next) => {
  let input=req.body
      Chatlog.update({ TChat_Log_Is_Mute: input.isMute }, {
        where: { 
         TChat_Log_Sender: input.userId,
        TChat_Log_Chat_Room_ID:input.roomId }
    }).then(res => { })
    Userroom.update({ DUSER_ROOM_IS_Mute:input.isMute }, {
      where: { 
       DUSER_ROOM_UID: input.userId,
      DUSER_ROOM_Chat_Room_ID:input.roomId }
  }).then(res => { })
      res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        msg: "Successfully updated"
      });
     
});

// home notificatioin count

router.get('/notification_count', (req, res, next) => {
  Chatlog.findAll({
   where: { 
     TChat_Log_Sender:req.query.userId,
      TChat_Log_IS_Archive:true,
     }
  }).then(value=>{
   let chatlog = JSON.parse(JSON.stringify(value));
   let totalArchiveList=0
   chatRoom=[]
   if(chatlog.length>0){
     totalArchiveList=chatlog.length
     _.forEach(chatlog, data => {
       if (data.TChat_Log_Chat_Room_ID != null) {
         chatRoom.push(data.TChat_Log_Chat_Room_ID)
       }
   })
  }
 
  MessageRecord.findAll({
   where: { 
      TMESSAGES_Record_UID: req.query.userId,
      TMESSAGES_Record_Read_Status:["Delivered", "Sent"] , 
      TMESSAGES_Record_IS_Delete: false,
      TMESSAGES_Record_Chat_Room_ID:{ [Op.not]: chatRoom
      } 
     },
   attributes: [[Sequelize.fn('count', Sequelize.col('TMESSAGES_Record_ID')), 'Total_notification_count']],
  })
  .then(unreadMsgCount => {
   res.setHeader("statusCode", 200);
   res.status(200).json({
     status: "Success",
     statusCode: 200,
     data: unreadMsgCount[0],
     totalArchiveList:totalArchiveList

   });   
  }).catch(e=>{
   res.setHeader("statusCode", 202);
   res.status(202).json({
   status: "Failed",
   statusCode: 202,
   message:e
 });
 });
}).catch(e=>{
     res.setHeader("statusCode", 202);
     res.status(202).json({
     status: "Failed",
     statusCode: 202,
     message:e

   });  
});
});
//unread message count
router.get('/unread_messages', (req, res, next) => {
  MessageRecord.findAll({
    where: { TMESSAGES_Record_UID: req.query.userId, TMESSAGES_Record_Read_Status: "Sent", TMESSAGES_Record_IS_Delete: false },
    attributes: ["TMESSAGES_Record_Chat_Room_ID", [Sequelize.fn('count', Sequelize.col('TMESSAGES_Record_Chat_Room_ID')), 'Unread_msg_count']],
    group: ['TMESSAGES_Record_Chat_Room_ID'],
  })
    .then(unreadMsgCount => {
      successHandler(unreadMsgCount, res);
    });
});

// group list
router.get('/groupDetails', (req, res, next) => {
   let roomId = req.query.roomId;
  let userId = req.query.userId
  let searchQuery
  let limit = req.query.limit || 100000
  let pageNumber = req.query.page || 1
  let offset = limit * (pageNumber - 1)
  if (req.query.search != undefined && req.query.search) {
    searchQuery = `'${req.query.search}'`
  } else {
    searchQuery = '""'
  }
  userId = `"${userId}"`
 let setQuery=`CALL roomDetails(${limit},${offset},${roomId},${searchQuery},${userId})`
 config.raw([setQuery]).then((response) => {
   if(response){
   var finalObject = JSON.parse(JSON.stringify(response[0]));
  let userRole
   let  my_role=_.forEach(finalObject[2],function(res){
    if(res.DUSER_ROOM_UID==req.query.userId){
      userRole=res.DUSER_ROOM_Role
      return res.DUSER_ROOM_Role
    }
   })
 if(my_role.length==0){
  my_role=[{DUSER_ROOM_Role:""}]
 }
//  _.forEach(finalObject[2],function(mydetail){
//    if(mydetail.DUSER_ROOM_UID==req.query.userId){
//     mydetail.name="You"
//    }
//  })
  res.setHeader("statusCode", 200);
      res.status(200).json({
        status: "Success",
        statusCode: 200,
        total_count:finalObject[0][0].counts, //data.count,
        my_role:userRole,
        page: pageNumber,//pages
        data: finalObject[1],
        users: finalObject[2],

       })
  }
  else{
    res.setHeader("statusCode", 204);
    res.status(204).json({
      status: "Success",
      statusCode: 204,
      data:"Something went wrong"
    })  }
  })
  
})


//filter admin users 
function filterAdminUser(reqQuery, data, callback) {
  if (data.length != 0) {
    let userData = JSON.parse(JSON.stringify(data));
    let itemsProcessed = 0;
    let contactsArray = [];
    let contactJson = {};

    for (var i = 0; i < userData.length; i++) {
      itemsProcessed++;
      let list = userData[i];
      if (_.size(list.chatRoomData) != 0) {
        let filterAdmin = _.filter(list.chatRoomData, function (roomUserObj) {
          if (roomUserObj.DUSER_ROOM_Role == "Admin") {
            return roomUserObj;
          }
        });
        if (filterAdmin.length != 0 && filterAdmin[0].DUSER_ROOM_UID == reqQuery.userId) {
          list.adminUser = true;
        } else {
          list.adminUser = false;
        }
      }
      if (itemsProcessed === userData.length) {
        callback(userData);
      }
    };
  } else {
    callback(data);
  }
}

//grouplist without current User
router.get('/grouplistexitcurrentuser', (req, res, next) => {
  let limit = parseInt(req.query.limit);
  let offset = 0;
  Chatroom.findAndCountAll()
    .then((data) => {
      let page = parseInt(req.query.page);
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      Chatroom.findAll({
        where: {
          HCHAT_ROOM_Chat_Room_ID: req.query.roomId
        },
        include: [
          {
            model: Userroom, as: 'chatRoomData',
            include: [
              { model: User, as: 'userRoomData' }
            ]
          },
        ],

      })
        .then((chatRoomRes) => {

          omitcurrrentuser(req.query, chatRoomRes, function (filteredRoomUsers) {
            res.setHeader("statusCode", 200);
            res.status(200).json({
              status: "Success",
              statusCode: 200,
              data: filteredRoomUsers
              // count: data.count,
              // pages: pages
            });
          });
        });
    })
    .catch(next);
});

// omit current user
function omitcurrrentuser(reqQuery, data, callback) {
  if (data.length != 0) {
    let userData = JSON.parse(JSON.stringify(data));
    let itemsProcessed = 0;
    let contactsArray = [];
    let contactJson = {};
    // _.omit( JSON.parse(JSON.stringify(data)), )
    let filterAdmin = _.filter(JSON.parse(JSON.stringify(data))[0].chatRoomData, function (roomUserObj) {
      if (roomUserObj.DUSER_ROOM_UID != reqQuery.userId) {

        return roomUserObj;
      }
    })
    callback(filterAdmin);
  }
}
const Json2csvParser = require('json2csv').Parser;

//export chat conversation 
router.get('/export_chat', (req, res, next) => {
  let roomId = req.query.roomId;
  let userId = req.query.userId;
  let searchQuery
  let limit = req.query.limit || 100000
  let pageNumber = req.query.page || 1
  let offset = limit * (pageNumber - 1)
  if (req.query.search != undefined && req.query.search) {
    searchQuery = `'${req.query.search}'`
  } else {
    searchQuery = '""'
  }
  userId = `"${userId}"`
  
  let setQuery=`CALL get_messages(${limit},${offset},${roomId},${searchQuery},${userId})`

    connection.query(setQuery, function (err, response) {
      if(err){
            res.setHeader("statusCode", 202);
           res.status(202).json({
            status: "Success",
            statusCode: 202,
            msg:err
           }) 
      }else
    if(response)
    {
   
      var finalObject = JSON.parse(JSON.stringify(response));
      let date = moment().format("YYYYDDMM")
    let dir = path.resolve(__dirname, '../../../../../DeelChatFiles/Deelachatdoc/' + date);
    let timestamp= new Date().getTime();
    
    let export_chat_array=[]
    
    let content=finalObject[4] 
    let exportChat
    let csv=`DeelChat Conversation`
    
if(finalObject[3].length>0){
 
  let email= finalObject[3][0].DC_EMAil
  let username=finalObject[3][0].DC_FIRST_NAME+' '+finalObject[3][0].DC_LAST_NAME
  //let parser = new Json2csvParser(content);
  _.forEach(finalObject[4],function(element){
    let name=element.name?element.name:element.phone
     csv = csv + " \n " + moment(element.created_date).format("YYYY-MM-DD HH:MM:SS") + " " + name + " :"+ element.TMESSAGES_Content
  });
  //csv = parser.parse(content);
  mkdirp(dir, function(err) { 
    if(!err){
      fs.writeFile(dir+'/'+date+'-'+timestamp+'deelChat.txt', csv, function (err) {
        console.log(err); // => null
        exportChat=configuration.authUrl + "/docs/" + date+'-'+timestamp+'deelChat.txt'
         sendMail(email,exportChat,username)
        res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          data:"Your chat has been exported successfully to registered email-id",
          msg:"Your chat has been exported successfully to registered email-id",
          URL:exportChat,
          EMAIL:email
        });
     
      })
    }else{
      res.setHeader("statusCode", 202);
  res.status(202).json({
    status: "Success",
    statusCode: 202,
    msg:err

   });
     }
 });
  // } catch (err) {
  
}else{
  res.setHeader("statusCode", 202);
  res.status(202).json({
    status: "Success",
    statusCode: 202,
    data:"Don't have conversation to export",
    msg:"Don't have conversation to export"

   });
}
  
   }
   else{
     res.setHeader("statusCode", 204);
     res.status(204).json({
       status: "Success",
       statusCode: 204,
       data:"Don't have conversation to export",
       msg:"Don't have conversation to export"

      })  }


   })

 
})

//  reverse fetch message 
router.get('/reverse_message', (req, res, next) => {

  let roomId = req.query.roomId;
  let userId = req.query.userId
  let searchQuery
  let limit = req.query.limit || 10
  let pageNumber = req.query.page || 1
  let offset = limit * (pageNumber - 1)

  console.log("@@@@@@@############ 1 /messges ", req.query)

  if (req.query.search != undefined && req.query.search) {
    searchQuery = `'${req.query.search}'`
  } else {
    searchQuery = '""'
  }
  userId = `"${userId}"`
  // })
  // updateTodayIndicatorMessage(roomId,req.query.userId)
 
   let setQuery=`CALL get_messages_test(${limit},${offset},${roomId},${searchQuery},${userId})`
  config.raw([setQuery]).then((response) => {
   if(response){
    var finalObject = JSON.parse(JSON.stringify(response[0]));
    let msgList = finalObject[4];
    if(msgList.length>0){
      msgList =  _.uniqBy(msgList, 'TMESSAGES_Message_ID');
    }
       res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          total_count: finalObject[0][0].counts, //data.count,
        
          page: pageNumber,//pages
          data: {
            message: msgList,
            roomDetail: finalObject[1],
            userRoom: finalObject[3],
            totalUsers: finalObject[2][0].total_members,
           }
        });
   }
   else{
     res.setHeader("statusCode", 204);
     res.status(204).json({
       status: "Success",
       statusCode: 204,
       data:"Something went wrong"
     })  }
   })
   
});



// router.get('/downloadDoc', (req, res, next) => {

//   let documentId = req.query.documentId;
//   let roomId = req.query.roomId;
//   let userId = req.query.userId

// MessageRecord.update({
// TMESSAGES_Record_Is_Download:1
// },{where:{

// }}).then((updatedDocRes) => {

// res.setHeader("statusCode", 200);
// res.status(200).json({
// status: "Success",
// statusCode: 200,
// Message: "Successfully uploaded",
// URL: thumbnailURL
// });
// });
// })




// message list

router.get('/messages', (req, res, next) => {
 
  let roomId = req.query.roomId;
  let userId = req.query.userId
  let searchQuery
  let limit = req.query.limit || 10
  let pageNumber = req.query.page || 1
  let offset = limit * (pageNumber - 1)

  console.log("@@@@@@@############ 1 /messges ", req.query)

  if (req.query.search != undefined && req.query.search) {
    searchQuery = `'${req.query.search}'`
  } else {
    searchQuery = '""'
  }
  userId = `"${userId}"`
  // })
  // updateTodayIndicatorMessage(roomId,req.query.userId)
 
  let setQuery=`CALL get_messages(${limit},${offset},${roomId},${searchQuery},${userId})`
  // connection.query(setQuery, function (err, recordset) {
  //   if(err){
  //     res.setHeader("statusCode", 202);
  //       res.status(202).json({
  //         status: "Failed",
  //         statusCode: 202,
  //         data:err
  //       })
  //   }else{
  //     var finalObject = JSON.parse(JSON.stringify(recordset));
  //     console.log(finalObject)
  //     if(finalObject[4].length>0){
  //       finalObject[4][0].TMESSAGES_Record_Today_First_message=1
  
  //     }
  //        res.setHeader("statusCode", 200);
  //         res.status(200).json({
  //           status: "Success",
  //           statusCode: 200,
  //           total_count: finalObject[0][0].counts, //data.count,
          
  //           page: pageNumber,//pages
  //           data: {
  //             message: finalObject[4],
  //             roomDetail: finalObject[1],
  //             userRoom: finalObject[3],
  //             totalUsers: finalObject[2][0].total_members,
  //            }
  //         });
  //   }
  // })

  config.raw([setQuery]).then((response) => {
   if(response){
     var finalObject = JSON.parse(JSON.stringify(response[0]));
     
    if(finalObject[4].length>0){
      finalObject[4][0].TMESSAGES_Record_Today_First_message=1

    }
       res.setHeader("statusCode", 200);
        res.status(200).json({
          status: "Success",
          statusCode: 200,
          total_count: finalObject[0][0].counts, //data.count,
        
          page: pageNumber,//pages
          data: {
            message: finalObject[4],
            roomDetail: finalObject[1],
            userRoom: finalObject[3],
            totalUsers: finalObject[2][0].total_members,
           }
        });
   }
   else{
     res.setHeader("statusCode", 204);
     res.status(204).json({
       status: "Success",
       statusCode: 204,
       data:"Something went wrong"
     })  }
   }).catch(e=>{
    res.setHeader("statusCode", 204);
    res.status(204).json({
      status: "Success",
      statusCode: 204,
      data:e
    })
   })
 
});

// get chat room messages
function clearAllChat(input,req, res, next) {
   
  MessageRecord.update({ TMESSAGES_Record_IS_Delete: true }, {
    where: {
      TMESSAGES_Record_UID: input.userId,
    },
    raw: true
  }).then((resp) => {
    if (resp[0] != 0) {
      Chatlog.update({ TChat_Log_Message_ID: null }, {
        where: { 
         TChat_Log_Sender: input.userId }
    }).then(res => { })
     
    // } else {
    //   res.setHeader("statusCode", 200);
    //   res.status(200).json({
    //     status: "Success",
    //     statusCode: 200,
    //     data: "No Record Fond!!!"
    //   });
    }
  });

}
function getChatRoomMessages(findQuery, userId, req, res, next) {

  let today = moment().utc().format("YYYY-MM-DD")
  let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');

  let limit = 50;
  let offset = 0;

  MessageRecord.findAll({
    where: findQuery,
    include: [{ model: Message, as: 'roomMessages' }]

  }).then((foundMessages) => {
    let room = {}
    Chatroom.find({ where: { HCHAT_ROOM_Chat_Room_ID: findQuery.TMESSAGES_Record_Chat_Room_ID } }).then(resp => {
      room = JSON.parse(JSON.stringify(resp))
    })

    Userroom.findAll({
      where: {
        DUSER_ROOM_Chat_Room_ID: req.query.roomId
      },
      raw: true
    })
      .then((userRoomRes) => {
        let currentUser = _.filter(JSON.parse(JSON.stringify(userRoomRes)), function (roomUserObj) {
          if (roomUserObj.DUSER_ROOM_UID == userId) {
            return roomUserObj;
          }
        })
        if (foundMessages.length == 0) {

          foundMessages = []
          res.setHeader("statusCode", 200);
          res.status(200).json({
            status: "Success",
            statusCode: 200,
            data: {
              message: foundMessages,
              userRoom: {
                "HCHAT_ROOM_Chat_Room_ID": room.HCHAT_ROOM_Chat_Room_ID,
                "HCHAT_ROOM_Name": room.HCHAT_ROOM_Name
              },
              roomDetail: currentUser,
              totalUsers: JSON.parse(JSON.stringify(userRoomRes)).length
            }
          });
        } else {
          let filterArr;
          if (foundMessages.length == 1) {
            filterArr = foundMessages;
          } else {
            filterArr = foundMessages.slice(Math.max(foundMessages.length - 100, 0));
          }

          let filterArrData = JSON.parse(JSON.stringify(filterArr));
          let itemsProcessed = 0;
          for (var i = 0; i < filterArrData.length; i++) {
            itemsProcessed++;
            let list = filterArrData[i];
            if (list.TMESSAGES_File_Type == "PDF") {
              if (list.TMESSAGES_File_Name != undefined && list.TMESSAGES_File_Name != null) {
                let splitName = list.TMESSAGES_File_Name.split('-')[1];
                if (splitName != undefined) {
                  list.TMESSAGES_File_Name = splitName;
                } else {
                  list.TMESSAGES_File_Name = list.TMESSAGES_File_Name;
                }
              }
            }
            if (itemsProcessed === filterArrData.length) {
              filterArrData[0].roomMessages.TMESSAGES_Today_First_message = 1
              res.setHeader("statusCode", 200);
              res.status(200).json({
                status: "Success",
                statusCode: 200,
                data: {
                  message: filterArrData,
                  roomDetail: currentUser,
                  userRoom: {
                    "HCHAT_ROOM_Chat_Room_ID": room.HCHAT_ROOM_Chat_Room_ID,
                    "HCHAT_ROOM_Name": room.HCHAT_ROOM_Name
                  },
                  totalUsers: JSON.parse(JSON.stringify(userRoomRes)).length
                }
              });
            }
          };
        }
      });
    // successHandler(filterArr, res);
    // });
  })
    .catch(next);
}

//update today indicator message
function updateTodayIndicatorMessage(roomId, userId,callback) {
  let today = moment.utc().format('YYYY-MM-DD');
   MessageRecord.findAll({
    where: {
      TMESSAGES_Record_Created_date: today,
      TMESSAGES_Record_Chat_Room_ID: roomId,
      TMESSAGES_Record_IS_Delete: false,
      TMESSAGES_Record_UID:userId },
    raw: true
  }).then(message => {
      if (message.length != 0) {
 
      for (var i = 1; i < message.length; i++) {
        let todaysMessageList = message[i];
          if (todaysMessageList.TMESSAGES_Record_Today_First_message) {
 
          MessageRecord.update({ TMESSAGES_Record_Today_First_message: false }, {
            where: { TMESSAGES_Record_ID: todaysMessageList.TMESSAGES_Record_ID,
             }
          }).then((updatedRes) => { });

        } 
      }
    }
  })

  Message.findAll({
    where: {
      TMESSAGES_Created_date: today,
      TMESSAGES_Chat_Room_ID: roomId,
      TMESSAGES_IS_Delete: false,
      TMESSAGES_IS_User_Join: false,
     },
    raw: true
  }).then((todaysMessage) => {
    if (todaysMessage.length != 0) {
      for (var i = 1; i < todaysMessage.length; i++) {
 
        let todaysMessageList = todaysMessage[i];

        if (todaysMessageList.TMESSAGES_Today_First_message) {
          Message.update({ TMESSAGES_Today_First_message: false }, {
            where: { TMESSAGES_Message_ID: todaysMessageList.TMESSAGES_Message_ID }
          }).then((updatedRes) => { });

        }
      }
    }
  });

}

// GET request to get all chatrooms
router.get('/', (req, res, next) => {
  Chatroom.findAll()
    .then((foundChatrooms) => {
      successHandler(foundChatrooms, res);
    })
    .catch(next);
});

// POST request to add a message
router.post('/:chatroomId/messages', (req, res, next) => {
  User.findById(req.body.userId)
    .then((foundUser) => {
      return Message.create(req.body)
        .then((createdMessage) => {
          const createdMessageInJSON = createdMessage.toJSON();
          createdMessageInJSON.user = foundUser;
          return createdMessageInJSON;
        });
    })
    .then((completeMessage) => {
      successHandler(completeMessage, res);
    })
    .catch(next);
});
function addUserToUserRoom(data) {

  _.forEach(data.roomUsers, function (userId) {
      let inputJson = {
          DUSER_ROOM_UID: userId,
          DUSER_ROOM_Chat_Room_ID: data.chatRoomId,
          DUSER_ROOM_Role: "User"
      };
      Userroom.findAll({
          where: inputJson,
          raw: true
      })
          .then((foundUserRoom) => {

              if (foundUserRoom.length == 0) {
                  return Userroom.create(inputJson)
                      .then((joinedUserRoom) => {
                          let joinedUserRoomInJSON = joinedUserRoom.toJSON();
                          let resArr = [];
                          return resArr.push(joinedUserRoomInJSON);
                      });
              } else {
                  return foundUserRoom;
              }
          })
          .then((joinedUserRes) => {
           });
  });
}
function failureHandler(data, res) {
  res.setHeader("statusCode", 400);
  res.status(400).json({
    status: "Failed",
    statusCode: 400,
    data: data
  });
}


router.get('/getReadInfo', (req, res, next) => {
  let input = req.query;
   if(input.chatRoomId&&input.messageId&&input.userId){
    let query=` SELECT DISTINCT
    SCON.name,
    RUSERS.DN_PHONE,
    REC.TMESSAGES_Record_UID,
    RUSERS.DC_USER_IMAGE,
    REC.TMESSAGES_Record_Read_Status,
    REC.TMESSAGES_Record_Updated_On
    FROM CON_T_Messages_Records as REC
 
    LEFT JOIN tbl_cu_chatusers RUSERS ON REC.TMESSAGES_Record_UID = RUSERS.DN_ID
     LEFT JOIN tbl_cu_sync_contacts SCON ON  REC.TMESSAGES_Record_UID= SCON.appUser AND  SCON.userId = "${input.userId}"
     where 
   TMESSAGES_Record_Chat_Room_ID=${input.chatRoomId} and
       TMESSAGES_Record_Message_ID= ${input.messageId} and not
       TMESSAGES_Record_UID="${input.userId}";`
      //  connection.query(query, function (err, response) {
      //    console.log(err,response)
      //     })
       config.raw([query]).then((response,err) => {
        if(err){
          res.setHeader("statusCode", 200);
          res.status(200).json({
            status: "Success",
            statusCode: 200,
            err
           });
         }else{
          response=JSON.parse(JSON.stringify(response[0]))
          let Read=[]
           let Sent=[]
           let Delivered=[]
           response.forEach(element => {
            if(element.TMESSAGES_Record_Read_Status==="Delivered"){
              Delivered.push(element)
            }else if(element.TMESSAGES_Record_Read_Status==="Read"){
              Read.push(element)
            }else{
              Sent.push(element)
            }
           });
          res.setHeader("statusCode", 200);
          res.status(200).json({
            status: "Success",
            statusCode: 200,
            response:{Read,Delivered,Sent}
          });
         }
         
       });
   }else{
    res.setHeader("statusCode", 200);
    res.status(200).json({
      status: "Success",
      statusCode: 200,
      msg:"please enter valid data"
    });
   }
   

});
function successHandler(data, res) {
  res.setHeader("statusCode", 200);
  res.status(200).json({
    status: "Success",
    statusCode: 200,
    data: data
  });
  
}
function successMessageHandler(data, res) {
  res.setHeader("statusCode", 200);
  res.status(200).json({
    status: "Success",
    statusCode: 200,
    data:data,
    msg: data
  });
}

function sendMail(email,content,username){
  let notifidata={
          "email":email,
          "subject":"export check",
          "content":`<p>Hi Mr/Mrs.${username} <a href=${content}> Click here </a>to download chat history</p>`
      }
  rp({
    url:configuration.DeelchatAPI+'deelChat/exportchat',
    'Content-type': 'application/json',

    method: 'POST',
    json: true,
    body:notifidata
  })
  .then((response) => {
    console.log('success', response);
  });

}

module.exports = router;
