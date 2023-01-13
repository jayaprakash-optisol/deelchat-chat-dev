CREATE DEFINER=`root`@`%` PROCEDURE `get_messages`(LimitPerPage int(255),pageNumber int(255),chatRoomId int(255),IN search varchar(255),IN userID varchar(255))
BEGIN
  select count(*) as counts from CON_T_Messages_Records
     where TMESSAGES_Record_Chat_Room_ID = chatRoomId and 
     TMESSAGES_Record_Chat_Room_ID = chatRoomId and 
   TMESSAGES_Record_UID=userID and
	 TMESSAGES_Record_IS_Delete = false ;
     
     select 
     ( select DUSER_ROOM_IS_Mute
 from CON_D_User_Rooms 
 WHERE  DUSER_ROOM_Chat_Room_ID=chatRoomId and
 DUSER_ROOM_UID=userID )as HCHAT_ROOM_IS_Mute,
     HCHAT_ROOM_IS_Group ,
     HCHAT_ROOM_Is_Broadcast,
     HCHAT_ROOM_Name ,
     HCHAT_ROOM_Chat_Room_ID,
     HCHAT_ROOM_Chat_Room_image
     from 
     CON_H_Chat_Rooms where HCHAT_ROOM_Chat_Room_ID=chatRoomId;
  
      
      select COUNT(DISTINCT DUSER_ROOM_UID ) as total_members from CON_D_User_Rooms
     where DUSER_ROOM_Chat_Room_ID = chatRoomId 
     and DUSER_ROOM_IS_User_left=false;
      
   select 
      DISTINCT  UR. DUSER_ROOM_UID,

	UR. DUSER_ROOM_UID,
     UR.DUSER_ROOM_Chat_Room_ID,
     UR.DUSER_ROOM_Role,
   
      SCON.name,
    UDE.DC_FIRST_NAME,
     UDE.DC_LAST_NAME ,
     RUSERS.DN_PHONE as phone,
          RUSERS.DC_USER_IMAGE

     from CON_D_User_Rooms UR
     left JOIN tbl_cu_chatusers RUSERS ON UR.DUSER_ROOM_UID= RUSERS.DN_ID
     left JOIN tbl_cu_sync_contacts SCON ON UR.DUSER_ROOM_UID = SCON.appUser and SCON.userId = userID
   	left JOIN tbl_cu_user_details UDE ON RUSERS.DN_USER_DETAILS = UDE.DN_DETAIL_ID

where 
    UR. DUSER_ROOM_Chat_Room_ID=chatRoomId and 
    UR. DUSER_ROOM_UID!=userID ;
   
       
      
     
   select 
   
	   DISTINCT MSG.TMESSAGES_Message_ID,

         MSG_Rec.TMESSAGES_Record_Message_ID,
     MSG_Rec.TMESSAGES_Record_Read_Status,
      MSG_Rec.TMESSAGES_Record_Today_First_message,
      MSG_Rec.TMESSAGES_Record_created_on,
     MSG.TMESSAGES_Message_ID,
   MSG.TMESSAGES_Content,
    MSG. TMESSAGES_Document_ID,
     MSG.TMESSAGES_Chat_Room_ID,
     MSG.TMESSAGES_File_Name,
     MSG.TMESSAGES_File_Type,
     MSG.TMESSAGES_Thumbnail_Url,
     MSG.TMESSAGES_IS_User_Join,
     MSG.TMESSAGES_UID ,
     MSG.TMESSAGES_Created_On,
     MSG.TMESSAGES_IS_User_Exit,
     MSG.TMESSAGES_IS_User_Join,
     MSG.TMESSAGES_IS_Reply,
     MSG.TMESSAGES_Reply_ID,
        MSG.  TMESSAGES_Reply_File_Type,

    MSG. TMESSAGES_Reply_contand,
  MSG.TMESSAGES_Read_Status,
   MSG.TMESSAGES_Contact_name,
 MSG. TMESSAGES_Contact_number,
  MSG.TMESSAGES_Lat,
  MSG.TMESSAGES_Long,
  MSG.TMESSAGES_IS_Deel_Keyword,
    MSG.TMESSAGES_IS_Dazz_id,
   MSG.TMESSAGES_IS_Nynm_string,
   MSG.TMESSAGES_IS_Nynm_short_string,
    RUSERS.DC_USER_IMAGE,
    RUSERS.DN_PHONE_ONE,
SCON.name,
 RUSERS.DN_PHONE as phone,
    UDE.DC_FIRST_NAME,
   UDE.DC_LAST_NAME
   
   
    from CON_T_Messages_Records MSG_Rec
     left JOIN CON_T_Messages MSG ON MSG_Rec.TMESSAGES_Record_Message_ID= MSG.TMESSAGES_Message_ID
      left JOIN tbl_cu_chatusers RUSERS ON  MSG.TMESSAGES_UID = RUSERS.DN_ID
   left JOIN tbl_cu_sync_contacts SCON ON MSG.TMESSAGES_UID = SCON.appUser and SCON.userId = userID 
  	left JOIN tbl_cu_user_details UDE ON RUSERS.DN_USER_DETAILS = UDE.DN_DETAIL_ID

     where TMESSAGES_Record_Chat_Room_ID = chatRoomId and 
	 TMESSAGES_Record_IS_Delete = false and
     TMESSAGES_Record_UID=userID and
       MSG.TMESSAGES_IS_User_Join =false and
     if(search !='',MSG.TMESSAGES_Content LIKE CONCAT('%',search ,'%'),1)
	  Order BY MSG_Rec.TMESSAGES_Record_Message_ID ASC
      LIMIT LimitPerPage OFFSET pageNumber;
      
     
END