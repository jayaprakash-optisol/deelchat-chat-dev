const router = require('express').Router();
const passport = require('passport');
const moment = require('moment');
const Chatroom = require('../../model/chatroom');
const Userroom = require('../../model/userroom');
const Chatlog = require('../../model/chatlog');
const User = require('../../model/user');
const UserDetails = require('../../model/userDetails')
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const map = require('lodash/map');
const each = require('lodash/forEach');
const _ = require('underscore');
const Message = require('../../model/message');
const Document = require('../../model/document');
const Chatrequest = require('../../model/chatrequest');
const MessageRecord = require('../../model/messageRecord')
const rp = require('request-promise');
const config = require('../../../config/configuration');
const Sync_contact = require('../../model/Sync_contact')
const configuration = require('../../../config/configuration');

 module.exports = {

    deleteGroup: function (data, callback) {
        let input = data;
    },
getUserLastSeen:function(data,callback){
    User.find({ where: { DN_ID: data.userId } }).then(res => {
        if(res){
            callback(null, JSON.parse(JSON.stringify(res)).DC_USER_LAST_SEEN);

        }else{
            callback(null, null);

        }
    })
},
   
    //update Active
    updateActive: function (data, callback) {
        
        let findQuery = {
            DUSER_ROOM_UID: data.userId,
         }
        if ((data.roomId != "") && (data.roomId != null) && (data.roomId != undefined)) {
            findQuery = {
                DUSER_ROOM_UID: data.userId,
                DUSER_ROOM_Chat_Room_ID: data.roomId
            }
        }  

   
            if(data.active==false){
                updateLastSeen(data)
            }
                    Userroom.update({ DUSER_ROOM_Active: data.active }, {
                        where: findQuery
                    })
                        .then((updatedRes) => {
                            callback(null, "Successfully updated");
                        });
               updateNotificationCount(data.userId)
    },
    notifyUser:function(data,onlinemembers,callback){
        
        Chatroom.findAll({
            where: {
                HCHAT_ROOM_Chat_Room_ID: data.chatRoomId
            },
            include: [
                {
                    model: Userroom, as: 'chatRoomData'
                },
            ],
            raw: true
        })
            .then((chatRoomRes) => {
                _.filter(chatRoomRes, function (roomObj) {
                  if (roomObj['chatRoomData.DUSER_ROOM_UID'] != data.userId&&roomObj['chatRoomData.DUSER_ROOM_IS_Mute'] != 1&&roomObj['chatRoomData.DUSER_ROOM_IS_User_left']==false) {

                        Sync_contact.find({
                            where: {
                                userId: roomObj['chatRoomData.DUSER_ROOM_UID'],
                                appUser: data.userId
                            }
                        }).then(contact_detail => {

                            let user_Details_json = JSON.parse(JSON.stringify(contact_detail))
                            let notifUser = {}
                            let notification_type = 3
                            let isOnline = []
                            data.isGroup=true
                            data.msg="someone left from ther grouup"

                            if (user_Details_json) {

                                if (user_Details_json.name) {
                                    notifUser = { "isMute": roomObj['chatRoomData.DUSER_ROOM_IS_Mute'], "name": user_Details_json.name, "userId": roomObj['chatRoomData.DUSER_ROOM_UID'] }
                                    // _.forEach(onlinemembers, function (response) {
                                    //     if (response.userId == notifUser.userId) {
                                    //         isOnline.push(response)

                                    //     }

                                    // })
                                    // if (isOnline.length == 0 || !roomObj['chatRoomData.DUSER_ROOM_Active']) {
                                        if(data.exit==true){
                                            data.msg=notifUser.name +" left from "+data.groupname
       
                                               }else{
                                                data.msg=data.groupname+" deleted by "+ notifUser.name
                                               }
                                        sendPushNotification(data, onlinemembers, notifUser, notification_type, callback)

                                    // }
                                }
                            } else {

                                // User.find({ where: { DN_ID: roomObj['chatRoomData.DUSER_ROOM_UID'] } }).then(res => {
                                User.find({ where: { DN_ID: data.userId } }).then(res => {

                                    notifUser = { "isMute": roomObj['chatRoomData.DUSER_ROOM_IS_Mute'], "name": JSON.parse(JSON.stringify(res)).DN_PHONE, "userId": roomObj['chatRoomData.DUSER_ROOM_UID'] }
                                    //send only offline members
                                    // _.forEach(onlinemembers, function (response) {
                                    //     if (response.userId == notifUser.userId) {
                                    //         isOnline.push(response)
                                    //     }
                                    // })

                                    // if (isOnline.length == 0 || !roomObj['chatRoomData.DUSER_ROOM_Active']) {
                                        if(data.exit==true){
                                            data.msg=notifUser.name +" left from "+data.groupname
       
                                               }else{
                                                data.msg=notifUser.name +" deleted "+data.groupname
  
                                               }
                                        sendPushNotification(data, onlinemembers, notifUser, notification_type, callback)

                                    // }
                                })
                            }

                        })
                    }
                });

            })
    },

    // exit group chat room: we have multiple admin in the group, 
    exitGroupChatRoom: function (data, callback) {
        let userRoomInput = {
            DUSER_ROOM_UID: data.user.userId,
            DUSER_ROOM_Chat_Room_ID: data.chatRoomId
        }
        // to check allready user left from group
        Userroom.findAll({
            where: userRoomInput,
            raw: true
        })
            .then((userRoomRes) => {
                if (userRoomRes.length != 0) {
                    let roomUser = userRoomRes[0];
                    if (roomUser.DUSER_ROOM_Role == "Admin") {
                        makeAdminSystematic(data, userRoomInput, function (resp) {
                            createMessageForChatExit(data);
                            if(resp){
                                callback(null, resp);

                            }
                        });
                    } else {
                        createMessageForChatExit(data);
                        deleteUserRooms(userRoomInput, callback);
                    }
                    // callback(userRoomRes)

                }
            });

    },
    fineMyName: function (data, callback) {
        User.find({
            where: { DN_ID: data.creatorId },
            raw: true,
            include: [
                { model: UserDetails, as: 'userDetails', attributes: ['DN_DETAIL_ID', 'DC_PROFILE_NAME'] },
            ],

        }).then((userRoomRes) => {

            callback(null, userRoomRes['userDetails.DC_PROFILE_NAME']);

        });
    },
    getUserNames: function (data, callback) {
        let userIds = []
        _.forEach(data.users, function (user) {
            userIds.push(user.userId)
        })
 
        User.findAll({
            where: { DN_ID: { $in: userIds } },
            raw: true,
            include: [
                { model: UserDetails, as: 'userDetails', attributes: ['DN_DETAIL_ID', 'DC_PROFILE_NAME'] },
            ],

        }).then((userRoomRes) => {
 
            let addUsersName = JSON.parse(JSON.stringify(userRoomRes))
            let userNames = []
            _.forEach(addUsersName, function (user) {
                userNames.push(user['userDetails.DC_PROFILE_NAME'])
            })
            callback(null,userNames);

        });
    },
    // find chat room 
    findChatRoom: function (data, callback) {
        Chatroom.findAll({
            where: {
                HCHAT_ROOM_Chat_Room_ID: data.chatRoomId
            },
            raw: true
        })
            .then((foundRoom) => {
                callback(null, foundRoom);

            });
    },
    // create createbroadcast room 
    createbroadcast: function (data, callback) {
        //groupname,creatorId
        let groupInput = {
            HCHAT_ROOM_Name: data.groupname,
            HCHAT_ROOM_IS_Group: true
        }
        let groupUniqueName;
        let message = {}
        Chatroom.findAll({
            where: groupInput,
            raw: true
        }).then((foundRoom) => {
            if (foundRoom.length == 0) {
                groupUniqueName = data.groupname;
            } else {
                groupUniqueName = foundRoom[0].HCHAT_ROOM_Name + ' ';
            }
            return Chatroom.create({
                HCHAT_ROOM_Name: groupUniqueName,
                HCHAT_ROOM_IS_Group: true,
                HCHAT_ROOM_Is_Broadcast: true
            }).then((createdRoom) => {

                let createdRoomInJSON = createdRoom.toJSON();
                createbroadcastRoomAndusers(data, createdRoomInJSON)
 

                // let resArr = [];
                // let chatRoomData = resArr.push(createdRoomInJSON);
                let today = moment().utc().format("YYYY-MM-DD");
                let createMsgJson = {
                    TMESSAGES_Content: `You created a broadcast list with ${data.users.length-1} recipients`, //roomUserIds.join()+ " Joined the chat",
                    TMESSAGES_UID: data.creatorId,
                    TMESSAGES_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                    TMESSAGES_Created_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    TMESSAGES_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    TMESSAGES_IS_User_Join: true,
                    TMESSAGES_Created_date: today,
                    // TMESSAGES_Mobile_dateTime:data.groupCreatedTime
                };
                // create message

                return Message.create(createMsgJson).then((msgRep) => {
                    message = JSON.parse(JSON.stringify(msgRep))
                    //create room

                    // Chatroom.update({ HCHAT_ROOMS_Message_ID: msgRep.TMESSAGES_Message_ID }, {
                    //     where: { HCHAT_ROOM_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID }
                    // }).then((updatedRes) => { });
                    //create log
                    let chatLogInputForUsers = {
                        "TChat_Log_Status": "Message",
                        "TChat_Log_Chat_Request_ID": 0,
                        "TChat_Log_Chat_Room_ID": createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                        "TChat_Log_Sender": data.creatorId,
                        "TChat_Log_Is_Broadcast": true,
                        "TChat_Log_Updated_On": new Date().toISOString().slice(0, 19).replace('T', ' '),
                        "TChat_Log_Message_ID": msgRep.TMESSAGES_Message_ID
                    };
                    let userMessage = {

                        TMESSAGES_Record_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                        // TMESSAGES_Record_Read_Status: createdMessage.TMESSAGES_Read_Status,
                        TMESSAGES_Record_Message_ID: msgRep.TMESSAGES_Message_ID,
                        TMESSAGES_Record_Content: msgRep.TMESSAGES_Content,
                        TMESSAGES_Record_UID: data.creatorId,
                        TMESSAGES_Record_Read_Status:"Read"
                    }
                    MessageRecord.create(userMessage).then(res => {

                    })

                    return Chatlog.create(chatLogInputForUsers).then((chatLogResponse) => {
                        const dataObj = chatLogResponse.get({ plain: true });
                        // return createdRoom
                        //  callback(null, createdRoomInJSON);
                        callback(null, createdRoomInJSON)

                    });
                })

            })
            // .then(completeRoomCreation => {
            // //    callback(null, completeRoomCreation);
            // });
        })

    },
    createUserRoom: function (data, callback) {

        addUserToUserRoom(data, callback);
    },
    //create group chat room
    createGroupChatRoom: function (data, callback) {
        let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let groupInput = {
            HCHAT_ROOM_Name: data.groupname,
            HCHAT_ROOM_IS_Group: true
        }
        let groupUniqueName;
        let message = {}
        Chatroom.findAll({
            where: groupInput,
            raw: true
        })
            .then((foundRoom) => {
                 if (foundRoom.length == 0) {
                    groupUniqueName = data.groupname;
                } else {
                    groupUniqueName = foundRoom[0].HCHAT_ROOM_Name + ' ';
                }


                return Chatroom.create({
                    HCHAT_ROOM_Name: groupUniqueName,
                    HCHAT_ROOM_IS_Group: true,
                    HCHAT_ROOM_Created_By:data.creatorId
                }).then((createdRoom) => {
                   
                    let createdRoomInJSON = JSON.parse(JSON.stringify(createdRoom));
                    let resArr = [];
                    let chatRoomData = resArr.push(createdRoomInJSON);
                    let today = moment().utc().format("YYYY-MM-DD");
 
                    let createMsgJson = {
                        TMESSAGES_Content: " ", //roomUserIds.join()+ " Joined the chat",
                        TMESSAGES_UID: data.creatorId,
                        TMESSAGES_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                        TMESSAGES_Created_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        TMESSAGES_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        TMESSAGES_IS_User_Join: true,
                        TMESSAGES_Created_date: today,
                        // TMESSAGES_Mobile_dateTime:data.groupCreatedTime
                    };
                    
                    return Message.create(createMsgJson).then((msgRep) => {
                        message = JSON.parse(JSON.stringify(msgRep))
                         createdRoomInJSON.message = JSON.parse(JSON.stringify(msgRep))
 
                        Chatroom.update({ HCHAT_ROOMS_Message_ID: JSON.parse(JSON.stringify(msgRep)).TMESSAGES_Message_ID }, {
                            where: { HCHAT_ROOM_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID }
                        }).then((updatedRes) => { });

                        Chatlog.update({ TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '), TChat_Log_Message_ID: JSON.parse(JSON.stringify(msgRep)).TMESSAGES_Message_ID }, {
                            where: { TChat_Log_Is_userLeft: false, TChat_Log_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID }
                        }).then(res => { })
                        createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID = createMsgJson.TMESSAGES_Chat_Room_ID
                        return createdRoomInJSON;

                    })


                });
            })
            .then((completeRoomCreation) => {
                // completeRoomCreation.messageId = message.TMESSAGES_Message_ID
                callback(null, completeRoomCreation);
            });

    },

    //create chat room
    createChatRoom: function (data, callback) {

        let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
        Chatroom.findAll({
            where: {
                [Op.or]: [{ HCHAT_ROOM_Name: data.room1 }, { HCHAT_ROOM_Name: data.room2 }]
            },
            raw: true
        })
            .then((foundRoom) => {
                if (foundRoom.length == 0) {
                    return Chatroom.create({ HCHAT_ROOM_Name: data.room })
                        .then((createdRoom) => {
                            let createdRoomInJSON = createdRoom.toJSON();
                            let resArr = [];
                            let chatRoomData = resArr.push(createdRoomInJSON);
                            return resArr;

                        });
                } else {
                    return foundRoom;
                }
            }).then((completeRoomCreation) => {
                callback(null, completeRoomCreation);
            });
    },
    //check user already chat or not
    addUserToUserRoom: function (data, callback) {

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
                    callback(null, joinedUserRes);
                });
        });
    },
    // new user join to the chatRoom 
    //join user to chat room
    addMembers: function (data, callback) {

        let username = _.map(data.data.users, 'username');
        let today = moment().utc().format("YYYY-MM-DD");

        let createMsgJson = {
            TMESSAGES_Content:data.data.creator_name+" added " + data.data.username.join(),
            TMESSAGES_UID: data.data.creatorId,
            TMESSAGES_Chat_Room_ID: data.data.chatRoomId,
            TMESSAGES_Created_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
            TMESSAGES_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
            TMESSAGES_IS_User_Join: true,
            TMESSAGES_Created_date: today,
            // TMESSAGES_Mobile_dateTime:data.data.joingroupTime

        };

        let message
        Message.create(createMsgJson).then((msgRep) => {
            message = msgRep
            // Chatroom.update({ HCHAT_ROOMS_Message_ID: message.TMESSAGES_Message_ID }, {
            //     where: { HCHAT_ROOM_Chat_Room_ID: data.data.chatRoomId }
            // }).then((updatedRes) => { });
            Chatlog.update({ TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
             TChat_Log_Message_ID: message.TMESSAGES_Message_ID }, {
                where: { TChat_Log_Is_userLeft: false, TChat_Log_Chat_Room_ID: data.data.chatRoomId }
            }).then(res => { })

            let roomId = data.data.chatRoomId;
            _.forEach(data.data.users, function (user) {
                let userMessage = {
                    TMESSAGES_Record_Chat_Room_ID: roomId,
                    TMESSAGES_Record_Read_Status: "Read",
                    TMESSAGES_Record_Message_ID: message.TMESSAGES_Message_ID,
                    TMESSAGES_Record_Content: createMsgJson.TMESSAGES_Content,
                    TMESSAGES_Record_UID: user.userId,
                 
                }
                MessageRecord.create(userMessage).then(res => { })
                let inputJson = {
                    DUSER_ROOM_UID: user.userId,
                    DUSER_ROOM_Chat_Room_ID: roomId,
                };


                Userroom.findAll({
                    where: inputJson,
                    raw: true
                })
                    .then((foundUserRoom) => {
                         if (foundUserRoom.length == 0) {
                            inputJson['DUSER_ROOM_Role'] = 'User'
                            return Userroom.create(inputJson)
                                .then((joinedUserRoom) => {
                                    createlogforAddusers(data, inputJson, message);
                                });
                        } else {
                            
                             Userroom.update({ DUSER_ROOM_IS_User_left: false,DUSER_ROOM_Role:"User" }, {
                                where: inputJson
                            }).then((updatedRes) => { });
                            createlogforAddusers(data, inputJson, message);

                        }
                    })
                    .then((joinedUserRes) => {
                        callback(null, joinedUserRes);
                    });
            });
        })
    },

    //join user to chat room
    joinUserToChatRoom: function (data, callback) {
        if (data.data.isGroup && data.data.addUsers) {

            if (data.data.users) {

                let roomUserIds = _.map(data.data.users, 'username');
                let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
                let today = moment().utc().format("YYYY-MM-DD");
                //update last update time in log who are in the group
                Chatlog.update({
                    TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    TChat_Log_Is_userLeft: false,
                    TChat_Log_IS_Delete: false
                },
                    {
                        where: {
                            TChat_Log_Sender: data.data.users[0].userId,
                            TChat_Log_Chat_Room_ID: data.data.chatRoomId
                        }
                    })
                    .then(resp => {
                    }).then((updatedRes) => { });
                Message.update({ TMESSAGES_IS_User_Exit: 0 }, {
                    where: { TMESSAGES_UID: data.data.users[0].userId, TMESSAGES_Chat_Room_ID: data.data.chatRoomId }
                })
                .then((updatedRes) => { });
                let msg
                if (data.data.createGroup) {
                    msg = "New group initiated"
                } else {
                    msg = roomUserIds.join() + " Joined the chat"
                }
                let createMsgJson = {
                    TMESSAGES_Content: msg,
                    TMESSAGES_UID: data.data.creatorId,
                    TMESSAGES_Chat_Room_ID: data.data.chatRoomId,
                    TMESSAGES_Created_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    TMESSAGES_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    TMESSAGES_IS_User_Join: true,
                    TMESSAGES_Created_date: today,
                    // TMESSAGES_Mobile_dateTime:data.data.joingroupTime

                };

                let createdMessage
                Message.create(createMsgJson).then((msgRep) => {
                    createdMessage = JSON.parse(JSON.stringify(msgRep))

                    // Chatroom.update({ HCHAT_ROOMS_Message_ID: msgRep.TMESSAGES_Message_ID }, {
                    //     where: { HCHAT_ROOM_Chat_Room_ID: data.data.chatRoomId }
                    // }).then((updatedRes) => { });
                    Chatlog.update({ TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                     TChat_Log_Message_ID: msgRep.TMESSAGES_Message_ID }, {
                        where: { TChat_Log_Is_userLeft: false, TChat_Log_Chat_Room_ID: data.data.chatRoomId }
                    }).then(res => { })


                    data.data.messageId = createdMessage.TMESSAGES_Message_ID

                    let userMessage = {
                        TMESSAGES_Record_Chat_Room_ID: createdMessage.TMESSAGES_Chat_Room_ID,
                        TMESSAGES_Record_Read_Status: createdMessage.TMESSAGES_Read_Status,
                        TMESSAGES_Record_Message_ID: createdMessage.TMESSAGES_Message_ID,
                        TMESSAGES_Record_Content: createdMessage.TMESSAGES_Content,
                        TMESSAGES_Record_UID: createdMessage.TMESSAGES_UID,
                        TMESSAGES_Record_Read_Status: "Read",
                    }
                    MessageRecord.create(userMessage).then(res => { })
                })
            }
        }
        let roomId = data.data.chatRoomId;
        _.forEach(data.data.users, function (user) {
            let userId = user.userId
            let inputJson = {
                DUSER_ROOM_UID: user.userId,
                DUSER_ROOM_Chat_Room_ID: roomId,
            };

            if (data.data.isGroup && data.data.creatorId == user.userId) {
                inputJson['DUSER_ROOM_Role'] = 'Admin';
            } else {
                inputJson['DUSER_ROOM_Role'] = 'User';
            }
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
                                if (data.data.isGroup) { // && data.data.createLogs
                                    createUserLogs(data, inputJson);
                                }
                                return resArr.push(joinedUserRoomInJSON);
                            });
                    } else {
                        return foundUserRoom;
                    }
                })
                .then((joinedUserRes) => {
                    callback(null, joinedUserRes);
                });
        });
    }
}
function addUserToUserRoom(data, callback) {
   return _.forEach(data.roomUsers, function (userId) {
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
                callback(null, joinedUserRes);
            });
    });
}

// create message for user  left : added message id to chatroom table to view last message
function createMessageForChatExit(data) {
    let today = moment().utc().format("YYYY-MM-DD")

    let username = "User"

    User.find({
        where: { DN_ID: data.user.userId },
        raw: true,
        include: [
            { model: UserDetails, as: 'userDetails', attributes: ['DN_DETAIL_ID', 'DC_PROFILE_NAME'] },
        ],

    }).then((userRoomRes) => {
        username = userRoomRes['userDetails.DC_PROFILE_NAME']
        let msg
        if (data.leftType == "remove") {
            msg = data.username + " removed " + username
        } else if (data.leftType == "left") {
            msg = username + " Left the Group "
        }

        let createMsgJson = {
            TMESSAGES_Content: msg,
            TMESSAGES_UID: data.user.userId,
            TMESSAGES_Chat_Room_ID: data.chatRoomId,
            TMESSAGES_Created_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
            TMESSAGES_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
            TMESSAGES_IS_User_Exit: true,
            TMESSAGES_IS_User_Join:true,
            TMESSAGES_Created_date: today,
            // TMESSAGES_Mobile_dateTime:data.TMESSAGES_Mobile_dateTime
        };

        Message.create(createMsgJson).then((msgRep) => {

            Chatroom.update(
                { HCHAT_ROOMS_Message_ID: msgRep.TMESSAGES_Message_ID, HCHAT_ROOMS_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' ') }, {
                    where: { HCHAT_ROOM_Chat_Room_ID: data.chatRoomId }
                })
                .then((updatedRes) => { });
            createMessageRecordLogs(data, JSON.parse(JSON.stringify(msgRep)))

            Chatlog.update({
                TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                TChat_Log_Message_ID: msgRep.TMESSAGES_Message_ID
            }, {
                    where: {
                        // update all users in logs
                        TChat_Log_Chat_Room_ID: data.chatRoomId,
                        TChat_Log_Is_userLeft: false
                    }
                }).then(res => {
                    Chatlog.update({
                        TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        TChat_Log_Is_userLeft: true
                    }, {
                            where: {
                                TChat_Log_Sender: data.user.userId,
                                TChat_Log_Chat_Room_ID: data.chatRoomId,
                            }
                        }).then(res => { })
                })

        })
    })
}

//crete mesager record for each user 
function updateLastSeen(data){
     User.update({ DC_USER_LAST_SEEN: new Date().toISOString().slice(0, 19).replace('T', ' ') }, {
        where: { DN_ID: data.userId }
    }).then((updatedRes) => { });

}
function createMessageRecordLogs(data, createdMessage) {
    let userMessage = {

        TMESSAGES_Record_Chat_Room_ID: createdMessage.TMESSAGES_Chat_Room_ID,
        TMESSAGES_Record_Read_Status: createdMessage.TMESSAGES_Read_Status,
        TMESSAGES_Record_Message_ID: createdMessage.TMESSAGES_Message_ID,
        TMESSAGES_Record_Content: createdMessage.TMESSAGES_Content,
        TMESSAGES_Record_Read_Status: "Read",
    }

    Chatroom.findAll({
        where: {
            HCHAT_ROOM_Chat_Room_ID: data.chatRoomId
        },
        include: [{ model: Userroom, as: 'chatRoomData' }],
        raw: true
    })
        .then((chatRoomRes) => {
            _.forEach(chatRoomRes, function (roomObj) {
 
                if(data.user.userId==roomObj['chatRoomData.DUSER_ROOM_UID']){
                    let notification_type=3
                    let notifUser = { "isMute": roomObj['chatRoomData.DUSER_ROOM_IS_Mute'],"userId": roomObj['chatRoomData.DUSER_ROOM_UID'] }
     
    //    if(data.leftType == "left"){
        // let notifyData={
        //     istype:"text",
        //     msg:data.username +"removed you",
        //     userId:createdMessage.TMESSAGES_UID, 
        //     chatRoomId: roomObj['chatRoomData.DUSER_ROOM_Chat_Room_ID'],
        //     roomname:roomObj["HCHAT_ROOM_Name"]
        //  }
        // sendPushNotification(notifyData, data, notifUser, notification_type)

    //   }
                    
                }
                let userId = roomObj['chatRoomData.DUSER_ROOM_UID']
                userMessage.TMESSAGES_Record_UID = userId

                MessageRecord.create(userMessage).then(res => { })
            });
        });


}

function sendPushNotification(data, onlineMember, receiver, notification_type) {
    
     
     let notifyData={}
    if (data.isGroup) {

        notifyData = {
            "senderId": data.userId,
            "receiverId": receiver.userId,
            "description": data.msg,
            "notificationType": notification_type,
            "chatRoomId": data.chatRoomId,
            "chatRoomName": data.groupname,
            "type": "",
            "refId": ""
        }

    } else {

        notifyData = {
            "senderId": data.userId,
            "receiverId": receiver.userId,
            "description": data.msg,
            "notificationType": notification_type,
            "chatRoomId": data.chatRoomId,
            "type": "",
            "refId": ""
        }

    }

    rp({
        url: config.DeelchatAPI + 'deelChat/pushnotify',
        'Content-type': 'application/json',

        method: 'PUT',
        json: true,
        body: notifyData
    })
        .then((response) => {
           
        });


 
}

//make Admin sytematic delete (destroy) left user form table 
function makeAdminSystematic(data, userRoomInput, callback) {
    Userroom.update({ DUSER_ROOM_IS_User_left: true }, {
        where: userRoomInput
    }).then((updatedRes) => {

        Userroom.findAll({
            where: {
                DUSER_ROOM_Chat_Room_ID: data.chatRoomId,
                DUSER_ROOM_Role: 'Admin',
                DUSER_ROOM_IS_User_left: false
            },
            raw: true
        }).then((userRoomRes) => {
            if (userRoomRes.length == 0) {

                Userroom.findAll({
                    where: {
                        DUSER_ROOM_Chat_Room_ID: data.chatRoomId,
                        DUSER_ROOM_IS_User_left: false
                    },
                    raw: true
                }).then((userRoomRes) => {
                    let nextAdmin = userRoomRes[0];
if(nextAdmin){
    let nextAdminInput = {
        DUSER_ROOM_UID: nextAdmin.DUSER_ROOM_UID,
        DUSER_ROOM_Chat_Room_ID: nextAdmin.DUSER_ROOM_Chat_Room_ID
    }
    Userroom.update({ DUSER_ROOM_Role: 'Admin' }, {
        where: nextAdminInput
    })
        .then((updatedRes) => {
            callback(updatedRes);
        });
}else{
    callback("updatedRes");

}
                    
                })

            } else {
                callback(data);
            }
        });
    });
}

//delte user room (destroy)
function deleteUserRooms(userRoomInput, callback) {
    Userroom.update({ DUSER_ROOM_IS_User_left: true }, {
        where: userRoomInput
    }).then((updatedRes) => {

        callback(null, updatedRes);
    });


}

//add members logs with message id
function createlogforAddusers(data, inputJson, message) {
    let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let chatLogInputForUsers = {
        "TChat_Log_Status": "Message",
        "TChat_Log_Chat_Request_ID": 0,
        "TChat_Log_Chat_Room_ID": inputJson.DUSER_ROOM_Chat_Room_ID,
        "TChat_Log_Sender": inputJson.DUSER_ROOM_UID,
    };

    Chatlog.findAll({
        where: chatLogInputForUsers,
        raw: true
    }).then((chatlogsRes) => {

        if (chatlogsRes.length == 0) {
            chatLogInputForUsers.TChat_Log_Updated_On = new Date().toISOString().slice(0, 19).replace('T', ' ')
            chatLogInputForUsers.TChat_Log_Message_ID = message.TMESSAGES_Message_ID
            Chatlog.create(chatLogInputForUsers).then((chatLogResponse) => {
                const dataObj = chatLogResponse.get({ plain: true });
            });
        } else {
            Chatlog.update({
                TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                TChat_Log_Is_User_Delete: false,
                TChat_Log_IS_Delete:false,
                TChat_Log_Is_userLeft: false,
                TChat_Log_Message_ID: message.TMESSAGES_Message_ID,
            },{where: {
                    TChat_Log_Chat_Room_ID: inputJson.DUSER_ROOM_Chat_Room_ID,
                    TChat_Log_Sender: inputJson.DUSER_ROOM_UID
                }}
            ).then(res => { })


        }
    });
}

function createbroadcastRoomAndusers(data, createdRoomInJSON) {
    _.forEach(data.users, function (user) {
        if (data.creatorId != user.userId) {
            let room1 = data.creatorId + "&" + user.userId
            let room2 = user.userId + "&" + data.creatorId;
            Chatroom.findAll({
                where: {
                    [Op.or]: [{ HCHAT_ROOM_Name: room1 }, { HCHAT_ROOM_Name: room2 }]
                },
                raw: true
            }).then((foundRoom) => {
                if (foundRoom.length == 0) {
                    return Chatroom.create({ HCHAT_ROOM_Name: room1 })
                        .then((createdRoom) => {
                            let createdRooms = createdRoom.toJSON();
                            let roomUsersArr = []
                            roomUsersArr.push(data.creatorId)
                            roomUsersArr.push(user.userId)

                            addUserToUserRoom({ data: data, roomUsers: roomUsersArr, chatRoomId: createdRooms.HCHAT_ROOM_Chat_Room_ID }, function (err, joinedRoomResp) { });

                            let inputJson = {
                                DUSER_ROOM_UID: user.userId,
                                DUSER_ROOM_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                                DUSER_ROOM_Role: "User",
                                DUSER_ROOM_BroadCast_roomId: createdRooms.HCHAT_ROOM_Chat_Room_ID,
                                DUSER_ROOM_BroadCast_roomName: createdRooms.HCHAT_ROOM_Name
                            };
                            return Userroom.create(inputJson).then((joinedUserRoom) => {

                            })
                        });
                } else {
                    let inputJson = {
                        DUSER_ROOM_UID: user.userId,
                        DUSER_ROOM_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                        DUSER_ROOM_BroadCast_roomId: foundRoom[0].HCHAT_ROOM_Chat_Room_ID,
                        DUSER_ROOM_Role: "User",
                        DUSER_ROOM_BroadCast_roomName: foundRoom[0].HCHAT_ROOM_Name,

                    };

                    Userroom.create(inputJson).then((joinedUserRoom) => {

                    })

                }
            }).then((completeRoomCreation) => { });

        } else {
            let inputJson = {
                DUSER_ROOM_UID: user.userId,
                DUSER_ROOM_Chat_Room_ID: createdRoomInJSON.HCHAT_ROOM_Chat_Room_ID,
                DUSER_ROOM_Role: "Admin",
                // DUSER_ROOM_BroadCast_roomId: createdRooms.HCHAT_ROOM_Chat_Room_ID
            }
            Userroom.create(inputJson).then((joinedUserRoom) => { })


        }
    });

}
function updateNotificationCount( userId){
    
    rp({
        url: configuration.DeelchatAPI + 'deelChat/updatebatchnotificationcount',
        'Content-type': 'application/json',
        method: 'PUT',
        json: true,
        body: {
          "userId":userId,
          "typeList":[3]
          }
    }).then((response) => {
             console.log('Batch notification success', response);
        });
}


//Create user losgs

function createUserLogs(data, inputJson, message) {
    if (!data.data.messageId) {
        data.data.messageId = null
    }
    let timeNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let chatLogInputForUsers = {
        "TChat_Log_Status": "Message",
        "TChat_Log_Chat_Request_ID": 0,
        "TChat_Log_Chat_Room_ID": inputJson.DUSER_ROOM_Chat_Room_ID,
        "TChat_Log_Sender": inputJson.DUSER_ROOM_UID,
    };

    Chatlog.findAll({
        where: chatLogInputForUsers,
        raw: true
    }).then((chatlogsRes) => {

        if (chatlogsRes.length == 0) {
            chatLogInputForUsers.TChat_Log_Updated_On = new Date().toISOString().slice(0, 19).replace('T', ' ')
            chatLogInputForUsers.TChat_Log_Message_ID = data.data.messageId
            Chatlog.create(chatLogInputForUsers).then((chatLogResponse) => {
                const dataObj = chatLogResponse.get({ plain: true });
            });
        } else {
            Chatlog.update({
                TChat_Log_Updated_On: new Date().toISOString().slice(0, 19).replace('T', ' '),
                TChat_Log_Is_User_Delete: false,
                TChat_Log_IS_Delete:false,
                TChat_Log_Is_userLeft: false,
                TChat_Log_Message_ID: data.data.messageId,
             },{ where: {
                    TChat_Log_Chat_Room_ID: inputJson.DUSER_ROOM_Chat_Room_ID,
                    TChat_Log_Sender: inputJson.DUSER_ROOM_UID
                }
            }).then(res => { })


        }
    });
}
