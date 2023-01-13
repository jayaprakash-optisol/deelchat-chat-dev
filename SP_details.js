CREATE DEFINER=`root`@`%` PROCEDURE `my_logs`(LimitPerPage int,pageNumber int,IN search varchar(255),IN userID varchar(255),isForward boolean)
BEGIN
select count(*) as counts from CON_T_Chat_Logs where TChat_Log_Sender = userID and 
      TChat_Log_IS_Archive= false and
      TChat_Log_IS_Delete = false;
   select  
   DISTINCT LOG.TChat_Log_Chat_Room_ID,
    ( select count(TMESSAGES_Record_ID)   
 from CON_T_Messages_Records 
 WHERE 
  TMESSAGES_Record_Chat_Room_ID=LOG.TChat_Log_Chat_Room_ID and
 TMESSAGES_Record_UID=userID and 
 TMESSAGES_Record_IS_Delete=false and
 TMESSAGES_Record_Read_Status IN ("Sent","Delivered"))as Unread_msg_count,
    LOG.TChat_Log_Updated_On,
    LOG.TChat_Log_Is_userLeft,
    LOG.TChat_Log_Chat_Room_ID,
    LOG.TChat_Log_Is_Broadcast,
    LOG.TChat_Log_Is_Mute,
    CR.HCHAT_ROOM_Name,
    CR.HCHAT_ROOM_IS_Group,
    CR.HCHAT_ROOM_Chat_Room_image,
    CR.HCHAT_ROOM_Created_By,
   CR.HCHAT_ROOM_Description,
    MSG.TMESSAGES_Message_ID,
    MSG.TMESSAGES_Content,
   MSG. TMESSAGES_UID,
	 MSG.TMESSAGES_Read_Status,
    MSG_Rec.TMESSAGES_Record_Today_First_message as TMESSAGES_Today_First_message,
	MSG.TMESSAGES_IS_User_Join,
    MSG.TMESSAGES_Reply_ID,
    MSG.TMESSAGES_Reply_contand,
     MSG.TMESSAGES_File_Type,
    MSG. TMESSAGES_Contact_name,
    MSG. TMESSAGES_Contact_number,
    MSG. TMESSAGES_Lat,
    MSG.TMESSAGES_Long,
    MSG.TMESSAGES_IS_Nynm_short_string,
    UR.DUSER_ROOM_UID,
    UR.DUSER_ROOM_Role,
	RUSERS.DN_ID,
	RUSERS.DC_USERNAME,
    RUSERS.DC_USER_IMAGE,
	UDE.DC_FIRST_NAME,
	UDE.DC_LAST_NAME  ,
    SCON.name ,
 RUSERS.DN_PHONE as phone,
RUSERS.DC_STATUS AS statusText
    FROM CON_T_Chat_Logs LOG
    left JOIN CON_H_Chat_Rooms CR ON LOG.TChat_Log_Chat_Room_ID=CR.HCHAT_ROOM_Chat_Room_ID 
    left JOIN tbl_cu_chatusers RUSERS ON LOG.TChat_Log_Receiver = RUSERS.DN_ID
 	left JOIN CON_D_User_Rooms UR ON CR.HCHAT_ROOM_Chat_Room_ID = UR.DUSER_ROOM_Chat_Room_ID and UR.DUSER_ROOM_UID = userID 
   	left JOIN tbl_cu_user_details UDE ON RUSERS.DN_USER_DETAILS = UDE.DN_DETAIL_ID
    left JOIN tbl_cu_sync_contacts SCON ON  LOG.TChat_Log_Receiver= SCON.appUser and  SCON.userId = userID
   left JOIN CON_T_Messages_Records MSG_Rec ON  LOG.TChat_Log_Message_ID= MSG_Rec.TMESSAGES_Record_Message_ID and LOG.TChat_Log_Sender=MSG_Rec.TMESSAGES_Record_UID
    left JOIN CON_T_Messages MSG ON  LOG.TChat_Log_Message_ID= MSG.TMESSAGES_Message_ID




where TChat_Log_Sender = userID and 
      TChat_Log_IS_Archive= false and
      TChat_Log_IS_Delete = false and 
      TChat_Log_Initiated =false and
      TChat_Log_Is_User_Delete=false and 
          LOG.TChat_Log_Chat_Room_ID!='' and
        if(isForward=true,LOG.TChat_Log_Is_userLeft=false ,1) and

      if(search !='',SCON.name LIKE CONCAT('%',search ,'%') OR
      CR.HCHAT_ROOM_Name LIKE CONCAT('%',search ,'%') OR
       RUSERS.DN_PHONE LIKE CONCAT('%',search ,'%'),1)
      
      
	  Order BY TChat_Log_Updated_On DESC
      LIMIT LimitPerPage OFFSET pageNumber;
END
