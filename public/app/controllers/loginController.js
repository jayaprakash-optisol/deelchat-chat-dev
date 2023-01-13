angular.module('Controllers', [])
	.directive('focusMe', function ($timeout) {	// Custom directive for focus
		return {
			link: function (scope, element, attrs) {
				scope.$watch(attrs.focusMe, function (value) {
					if (value === true) {
						$timeout(function () {
							element[0].focus();
							scope[attrs.focusMe] = false;
						});
					}
				});
			}
		};
	})
	.controller('loginCtrl', function ($scope, $location, $rootScope, $socket) {		// Login Controller
		// Varialbles Initialization.
		$scope.userAvatar = "Avatar1.jpg";
		$scope.isErrorReq = false;
		$scope.isErrorNick = false;
		$scope.username = "";

		// redirection if user logged in.
		if ($rootScope.loggedIn) {
			$location.path('/v1/Users');
		}

		// Functions for controlling behaviour.
		$scope.redirect = function () {
			$scope.userTypeing = function (){
				console.log("@@@@@@@@@@@@@@@@@@")		
				 }
			if ($scope.username.length <= 20) {
				if ($scope.username) {
					// creat room
					let create_room = {
						// 19. create-broadcast: EMIT (send) 
						groupname: '😁😊😆☺😆😄🤗😄',
						creatorId: "c79f91c4-f751-46bb-8c8f-50e3227bd733",
						users: [{ userId: "c79f91c4-f751-46bb-8c8f-50e3227bd733", username: "durai" },
						{ userId: "13ec63a3-2181-4c10-aaa7-8322cd9b78a6", username: "hahahhahah" },
						{ userId: "a3699c9f-86cc-4a35-a1c4-0bf0086f6410", username: "hahahhahah" },
						{ userId: "de4e2ed5-77c7-493c-93ed-097437c7a14e", username: "hahahhahah" },

						{ userId: "6634d2eb-5df9-4d3b-af09-65d467605286", username: "duraiVinoth" },]
						
					}
					//send message
					// let data = {"roomname":"e59340b8-36f6-40d1-8c3b-d3dabbf10d0f&17e6bcd8-1c32-44dc-9392-55c9c5d43014",
					// "username":"8667587229","msg":"Hello","hasMsg":true,"hasFile":false,
					// "isReply":false,"reply_file_type":"text","replayMsgId":0,"messageContant":"",
					// "msgTime":"2019-05-14T21:57:07.470Z","istype":"text","isGroup":false,
					// "userId":"e59340b8-36f6-40d1-8c3b-d3dabbf10d0f","chatRoomId":631}

					let data ={ roomname:'75031685-e6fc-40f6-b851-ca6a19529d11&80eb8d99-2383-4b5e-aadf-4bbb797ccac2',
                     username: '7904901800',msg: 'pongal',hasMsg: true,hasFile: false,isReply: false,
                     reply_file_type: 'text',replayMsgId: 0,messageContant: '',msgTime: '2019-06-20T18:34:37.351Z',
                     istype: 'text',isGroup: false,userId: '80eb8d99-2383-4b5e-aadf-4bbb797ccac2',
                     chatRoomId: 801,unique_ref_id: '8011561035877348' }
					
					
					let datas = { roomId: data.chatRoomId, userId: data.userId, active: false }
 let oneonone={chatRoomId:18,userId:"947c873c-4375-431a-a227-ceb58e0dd0fd",}
//  socket.on('exit-group', function (data, callback) {

	let exitdata = {
	 groupname:"5555",
	  chatRoomId:786,
	  userId:"d3463923-70fe-43b9-8153-42ffdf7a3c11",
 	  leftType: "left",

	};	
	let remove_group={
		groupname: "cd",
		creatorId: 'c79f91c4-f751-46bb-8c8f-50e3227bd733',
		chatRoomId: 658,
		users: [{  "userId": "13ec63a3-2181-4c10-aaa7-8322cd9b78a6"					
		},
		 ]	  
		}
		let add_members={
			groupname: "cd",
			creatorId: '75031685-e6fc-40f6-b851-ca6a19529d11',
			chatRoomId: 327,
			users: [{ 
			userId: '66bbc065-ef3c-4453-862f-8342470f0782',
								 
			},
			{ 
			userId: '75031685-e6fc-40f6-b851-ca6a19529d11',
								  
			}]	  
			}
			let forward_message= {"chatRoomId": "",
			 "hasFile": false, 
			 "msg": "", 
			 "isReply": false,
			  "dazzId": "8664e761-a35a-4b11-9229-81f29bdfb32c",
			  "userId": "3f0eadb2-1f36-438c-9333-c2c553f93401",
				"users": [
					{"chatRoomId": 136, 
				"roomname": "d4696355-9eb6-48f0-841c-7d18c8985ea2&3f0eadb2-1f36-438c-9333-c2c553f93401"},
				 {"chatRoomId": 167, "roomname": "group go"},
				 {"chatRoomId": 164, "roomname": "im going to leave "},
				  {"chatRoomId": 147, "roomname": "all group"},
				   {"chatRoomId": 146, "roomname": "group 2"}],
				    "isGroup": "", "roomname": "", "istype": "dazz"}
	  let join_chat={senderId:"83a4d0f1-3f41-4d74-9671-3624fc0e51e3",receiverId:"75031685-e6fc-40f6-b851-ca6a19529d11"}

	// $socket.emit('add-group-members', add_members, function (data) {

	// $socket.emit('remove-group-members', remove_group, function (data) {

				// $socket.emit('exit-group', exitdata, function (data) {

				// $socket.emit('join-1on1-room', oneonone, function (data) {
// 
					// $socket.emit('update-user-active-status', datas, function (data) {
						// $socket.emit('send-message-to-users', forward_message, function (data) {

						$socket.emit('send-message', data, function (data) {
// 
    						// $socket.emit('join-user-chat', join_chat, function (data) {

						// $socket.emit('create-broadcast', create_room, function (data) {
						// $socket.emit('send-broadcast-message', data, function (data) {

	})
					$socket.emit('new-user', { userId: "8664e761-a35a-4b11-9229-81f29bdfb32c", username: $scope.username, userAvatar: $scope.userAvatar }, function (data) {
						console.log("@@@@@@@3.new-user@@@@@@@@@")
						

						console.log(data, $scope)

						if (data.success == true) {	// if nickname doesn't exists	
							$rootScope.username = $scope.username;
							$rootScope.userAvatar = $scope.userAvatar;
							$rootScope.loggedIn = true;
							$location.path('/v1/Users');
						} else {		// if nickname exists
							$scope.errMsg = "Use different nickname.";
							$scope.isErrorNick = true;
							$scope.isErrorReq = true;
							$scope.printErr($scope.errMsg);
						}
					});
				} else {		// blanck nickname 
					$scope.errMsg = "Enter a nickname.";
					$scope.isErrorReq = true;
					$scope.printErr($scope.errMsg);
				}
			} else {		// nickname greater than limit
				$scope.errMsg = "Nickname exceed 20 charachters.";
				$scope.isErrorNick = true;
				$scope.isErrorReq = true;
				$scope.printErr($scope.errMsg);
			}
		}

		$scope.printErr = function (msg) {	// popup for error message
			var html = '<p id="alert">' + msg + '</p>';
			if ($(".chat-box").has("p").length < 1) {
				$(html).hide().prependTo(".chat-box").fadeIn(1500);
				$('#alert').delay(1000).fadeOut('slow', function () {
					$('#alert').remove();
				});
			};
		}
		$scope.changeAvatar = function (avatar) {		// secting different avatar
			$scope.userAvatar = avatar;
		}
	})
	.controller('userCtrl', function ($scope, $location, $rootScope, $socket, $localStorage) {		// User Controller
		// Varialbles Initialization.
		$scope.users = [];
		$scope.groups = [];
		$scope.isErrorReq = false;
		$scope.isErrorNick = false;
		// ================================== Online Members List ===============================
		$socket.emit('get-online-members', { username: $rootScope.username }, function (data) {
		});
		$socket.on("online-members", function (data) {
			$scope.oldusers = $localStorage.localUsers;
			// console.log($localStorage.localUsers);	
			$scope.users = [];
			if (data && data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					data[i].highlight = false;
					if (data[i].username != $rootScope.username) {
						$scope.users.push(data[i]);
					}
				}
				if ($scope.oldusers && $scope.oldusers.length > 0) {
					for (var k = 0; k < $scope.oldusers.length; k++) {
						if ($scope.users && $scope.users.length > 0) {
							for (l = 0; l < $scope.users.length; l++) {
								if ($scope.oldusers[k].username == $scope.users[l].username && $scope.oldusers[k].highlight) {
									$scope.users[l].highlight = true;
									break;
								}
							}
						}
						console.log($scope.users);
						$localStorage.localUsers = $scope.users;
					}
				}
			}
		});

		$socket.emit('get-group', { username: $rootScope.username }, function (data) {
		});
		$socket.on("online-group", function (data) {
			$scope.oldgroups = $localStorage.localGroups;
			$scope.groups = [];
			if (data && data.length > 0) {
				for (var i = 0; i < data.length; i++) {
					data[i].highlight = false;
					if (data[i].users != null && data[i].users.length) {
						for (var k = 0; k < data[i].users.length; k++) {
							if (data[i].users[k].username == $rootScope.username) {
								$scope.groups.push(data[i]);
							}
						}
					}
				}
				if ($scope.oldgroups && $scope.oldgroups.length > 0) {
					for (var l = 0; l < $scope.oldgroups.length; l++) {
						if ($scope.groups && $scope.groups.length > 0) {
							for (var m = 0; m < $scope.groups.length; m++) {
								if ($scope.oldgroups[l].groupname == $scope.groups[m].groupname && $scope.oldgroups[l].highlight) {
									$scope.groups[m].highlight = true;
									break;
								}
							}
						}
						$localStorage.localGroups = $scope.groups;
					}
				}
			}
		});


		$scope.removeGroupMembers = function () {
			console.log("removeGroupMembers clicked!!!")
			let grpInp = {
				groupname: "cd",
				creatorId: 488,
				chatRoomId: 110,
				users: [{
					userId: 523,
					username: 'ANNAMALAI T',
					userAvatar: 'Avatar1.jpg'
				}]
			}
			$socket.emit('remove-group-members', grpInp, function (data) {

				console.log("@@@@ remove-group-members @@@")
				// console.log(data)

				// $socket.emit('get-group',{userId: 1, username: 'kl'},function(data){
				// 	console.log("@@@@ get-group @@@")
				// 	console.log(data)
				// });			
			});
		}


		$scope.onlineMembers = function () {
			console.log("onlineMembers clicked!!!")
			let userId = {
				"userId": 718
			}
			$socket.emit('get-user-online-status', userId, function (data) {
				console.log("@@@@ 1.get-user-online @@@")
				// console.log(data)
			});
			$socket.on("user-online-status", function (data) {
				console.log("@@@@@@@ 2.user-online @@@@@@@@@")
				console.log(data)
			});

			// $socket.emit('get-online-members',{},function(data){	
			// 	console.log("@@@@ 1.get-online-members @@@")
			// 	console.log(data)
			// });
			// $socket.on("online-members", function(data){
			// 	console.log("@@@@@@@ 2.online-members @@@@@@@@@")	
			// 	console.log(data)
			// });
		}



		$scope.sendRequest = function () {
			console.log("sendRequest clicked!!!")
			let grpInp = {
				"TCHAT_REQUEST_Sender": 121904,
				"TCHAT_REQUEST_Receiver": 172722
			}
			$socket.emit('send-chat-request', grpInp, function (data) {

				console.log("@@@@ 1.send-chat-request @@@")
				console.log(data)
			});



			console.log("delete message clicked!!!")
			// let grpInp = {
			// 	messageId: 4737,
			// 	roomname: 'iphone1',
			// 	username: 't',
			// 	hasMsg: true,
			// 	hasFile: false,

			// 	isGroup: true,
			// 	userId: 135619,
			// 	chatRoomId: 370
			// }

			$socket.emit('delete-message', grpInp, function (data) {

				console.log("@@@@ delete messaget @@@")
				console.log(data)
			});
		}
		$socket.on("chat-request-response", function (data) {
			console.log("@@@@@@@2.chat-request-response @@@@@@@@@")
			console.log(data)
		});




		$scope.addGroupMembers = function () {
			console.log("AddGroupMembers clicked!!!")
			let grpInp = {
				groupname: "text group",
				creatorId: 135619,
				chatRoomId: 436,
				users: [{
					userId: 1050,
					username: 'u1',
					userAvatar: 'Avatar1.jpg'
				},
				{
					userId: 1052,
					username: 'u2',
					userAvatar: 'Avatar1.jpg'
				}]
			}
			$socket.emit('add-group-members', grpInp, function (data) {

				console.log("@@@@ add-group-members @@@")
				console.log(data)

				// $socket.emit('get-group',{userId: 1, username: 'kl'},function(data){
				// 	console.log("@@@@ get-group @@@")
				// 	console.log(data)
				// });			
			});
		}

		// forward message to chat room users
		$scope.ForwardMessage = function () {

			$socket.emit("send-message-to-users",
				{
					userId: 488,
					username: 'test1',
					userAvatar: 'Avatar1.jpg',
					msg: 'test message',
					hasMsg: true,
					hasFile: false,
					msgTime: '2:12 pm',
					istype: "image/music/PDF",
					isGroup: true,
					users:
						[{
							chatRoomId: 78,
							roomname: 'test1-test2'
						},
						{
							chatRoomId: 79,
							roomname: 'test1-test3'
						}]
				}


				, function (data) {
					console.log("$$$$$$$$$ send-message-to-users $$$$$$$$$$")
					console.log(data)

				});

		}

		// ================================== 1 on 1 room ===============================
		$socket.on("1on1-room-name", function (data) {
			console.log("@@@@@@@2.1on1-room-name@@@@@@@@@")
			console.log(data)
			$rootScope.roomname = data.roomName;
		});

		$scope.replyToChatRequest = function (requestType) {
			let replyChatReqInput = {
				"senderId": "caa1148d-88c8-477b-bed3-f474292f1f07",
				"receiverId": "21187316-7728-41ad-a83e-6433c22d8175"
				// "senderUsername": "kl",
				// "receiverUsername": "FS"
			};
			$socket.emit('join-chat', replyChatReqInput, function (data) {
				console.log("@@@@@@@1.join-chat@@@@@@@@@")
				console.log(data)

			});
		}



		$scope.joinOneToOneRoom = function (requestType) {
			console.log("#############33234234234")
			let replyChatReqInput = {
				"chatRoomId": 14
			};
			$socket.emit('join-1on1-room', replyChatReqInput, function (data) {
				console.log("@@@@@@@ 3.join-1on1-room @@@@@@@@@")
				console.log(data)

			});
		}


		$scope.create1on1Room = function (user) {
			$scope.roomname = user.username + "-" + $rootScope.username;


			if ($scope.roomname) {
				$socket.emit('create 1on1 room', $scope.roomname, function (data) {

					if (data.success == true) {	// if nickname doesn't exists	
						//$rootScope.roomname = $scope.roomname;					
						//$localStorage.localUsers = $scope.users;					
						$localStorage.localGroups = $scope.groups;
						if ($scope.users && $scope.users.length > 0) {
							for (var i = 0; i < $scope.users.length; i++) {
								if ($scope.users[i].username == user.username) {
									$scope.users[i].highlight = false;
									$localStorage.localUsers = $scope.users;
									$location.path('/v1/ChatRoom');
								}
							}
						}
					} else {		// if nickname exists
						$scope.errMsg = "Use different roomname.";
						$scope.isErrorNick = true;
						$scope.isErrorReq = true;
						$scope.printErr($scope.errMsg);
					}
				});
			} else {		// blanck nickname 
				$scope.errMsg = "Enter a roomname.";
				$scope.isErrorReq = true;
				$scope.printErr($scope.errMsg);
			}
		}

		$scope.joinGroupRoom = function (groupname) {
			console.log("##### Join Group #######")
			console.log(groupname)

			$socket.emit('join-group', { groupname: groupname }, function (data) {
				if (data.success == true) {
					$rootScope.roomname = groupname;
					$localStorage.localUsers = $scope.users;
					$localStorage.localGroups = $scope.groups;
					$location.path('/v1/ChatGroup');
				}
			})
		}

		$scope.goToCreateGroup = function () {
			$localStorage.localUsers = $scope.users;
			$localStorage.localGroups = $scope.groups;
			$location.path('/v1/CreateGroup');
		}

		$scope.printErr = function (msg) {	// popup for error message
			var html = '<p id="alert">' + msg + '</p>';
			if ($(".chat-box").has("p").length < 1) {
				$(html).hide().prependTo(".chat-box").fadeIn(1500);
				$('#alert').delay(1000).fadeOut('slow', function () {
					$('#alert').remove();
				});
			};
		}

		// redirection if user is not logged in.
		if (!$rootScope.loggedIn) {
			$location.path('/v1/');
		}

		$socket.on('highlight-room', function (data) {
			console.log("@@@@@@@@@@@ highlight-room @@@@@@@@@@@@@@@@")
			console.log(data)
			if (data != null && data.username && !data.isGroup && $scope.users && $scope.users.length > 0) {
				for (var i = 0; i < $scope.users.length; i++) {
					if ($scope.users[i].username == data.username && data.receiverUsername == $rootScope.username) {
						$scope.users[i].highlight = true;
					}
				}
			}
			if (data != null && data.roomname && data.isGroup && $scope.groups && $scope.groups.length > 0) {
				for (var i = 0; i < $scope.groups.length; i++) {
					if ($scope.groups[i].groupname == data.roomname) {
						$scope.groups[i].highlight = true;
					}
				}
			}
		});
		$socket.on("new-message", function (data) {

			console.log("NEW MESSAGE!!!!!!!!!!!!!!!!!!!", data)
			// console.log(data)	

			// $socket.emit("update-message-status", { chatRoomId: 100, status: "Delivered" }, function(data){
			// 	console.log("$$$$$$$$$ message-status $$$$$$$$$$")
			// 	console.log(data)
			// });


			if (data.username == $rootScope.username) {
				data.ownMsg = true;
			} else {
				data.ownMsg = false;
			}
			// $scope.messeges.push(data);	
		});

	})