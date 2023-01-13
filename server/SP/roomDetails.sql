CREATE DEFINER=`root`@`%` PROCEDURE `roomDetails`(LimitPerPage int(255),pageNumber int(255),chatRoomId int(255),IN search varchar(255),IN userID varchar(255))
BEGIN
   select count(*) as counts from CON_D_User_Rooms
     where DUSER_ROOM_Chat_Room_ID = chatRoomId 
     and DUSER_ROOM_IS_User_left=false;

      select 
   DISTINCT HCHAT_ROOM_Chat_Room_ID,
   ( select DUSER_ROOM_IS_Mute
 from CON_D_User_Rooms 
 WHERE  DUSER_ROOM_Chat_Room_ID=chatRoomId and
 DUSER_ROOM_UID=userID )as HCHAT_ROOM_IS_Mute,
  HCHAT_ROOM_Name,
  HCHAT_ROOM_IS_Group,
  HCHAT_ROOM_Description,
  HCHAT_ROOM_Is_Broadcast,
  HCHAT_ROOM_Chat_Room_image
     from CON_H_Chat_Rooms 
     where HCHAT_ROOM_Chat_Room_ID = chatRoomId;
  select 
   DISTINCT UR.DUSER_ROOM_UID ,
        UR.DUSER_ROOM_Chat_Room_ID,
     	UR.DUSER_ROOM_Role,
       UR. DUSER_ROOM_IS_Mute,
		RUSERS.DC_USER_IMAGE,
         RUSERS.DN_PHONE as phone,
        SCON.name,
        RUSERS.DC_STATUS AS statusText
     from CON_H_Chat_Rooms CR
     left JOIN CON_D_User_Rooms UR ON CR.HCHAT_ROOM_Chat_Room_ID= UR.DUSER_ROOM_Chat_Room_ID and UR.DUSER_ROOM_IS_User_left=false
  	left JOIN tbl_cu_chatusers RUSERS ON UR.DUSER_ROOM_UID= RUSERS.DN_ID 
     left JOIN tbl_cu_sync_contacts SCON ON UR.DUSER_ROOM_UID = SCON.appUser and SCON.userId=userID

     where CR.HCHAT_ROOM_Chat_Room_ID = chatRoomId and 
     UR.DUSER_ROOM_Chat_Room_ID=chatRoomId and 
     UR.DUSER_ROOM_IS_User_left=false and
     if(search !='',SCON.name LIKE CONCAT('%',search ,'%'),1) 
     Order BY SCON.name ASC  
      LIMIT LimitPerPage OFFSET pageNumber;

     
  
  END