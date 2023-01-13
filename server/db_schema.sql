CREATE TABLE deelchat.Notification_Logs  (
    NOTIFICATION_LOGS_Notification_Logs_ID int(20) NOT NULL AUTO_INCREMENT PRIMARY KEY,
NOTIFICATION_LOGS_Notification_Type nvarchar(50) NULL,
NOTIFICATION_LOGS_Message text,
NOTIFICATION_LOGS_Sender bigint NULL,
NOTIFICATION_LOGS_Receiver bigint NULL,
NOTIFICATION_LOGS_Status nvarchar(50) NULL,
NOTIFICATION_LOGS_Created_On datetime NULL,
NOTIFICATION_LOGS_Chat_Room_ID bigint NULL,
NOTIFICATION_LOGS_Value nvarchar(100) NULL
);


ALTER TABLE deelchatdev.CON_D_User_Rooms
ADD DUSER_ROOM_BroadCast_roomName varchar(255);

alter table deelchattest.CON_T_Messages add column TMESSAGES_Brodcast_Message_ID  int(255)
alter table deelchattest.CON_T_Messages add column TMESSAGES_Reply_thumbnail  varchar(255)
 

ALTER TABLE deelchatdev.CON_H_Chat_Rooms
ADD HCHAT_ROOM_Created_By nvarchar(255);

