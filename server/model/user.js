const { Sequelize, INTEGER, STRING, VIRTUAL, DATE, BOOLEAN, UUID } = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const User = db.define('tbl_cu_chatusers', { //tbl_cu_chatusers => tbl_user

  DN_ID: { //DN_ID => DN_ID
    allowNull: false,
    autoIncrement: true,
    type: UUID,
    primaryKey: true
  },
  DC_USERNAME: { //DC_USERNAME => DC_USERNAME
    type: STRING,
    validate: {
      notEmpty: true,
    },
    unique: true,
  },
  DC_EMAil: STRING, //TUser_Emailid => DC_EMAil
  DN_PHONE: STRING,
  DN_PHONE_ONE: STRING,
  DN_PHONE_TWO: STRING,
  DC_USER_IMAGE: STRING,
  DC_SMALL_USER_IMAGE: STRING, //TUser_Image_Url => DC_USER_IMAGE
  DC_LARGE_USER_IMAGE: STRING,
  DC_THUMBNAIL_USER_IMAGE: STRING,
  DB_DELETED: {
    type: Boolean,
    defaultValue: false
  },
  DD_CREATED_ON: { //T_USERS_Created_On => DD_CREATED_ON
    type: Date,
    defaultValue: currentTime
  },
  DC_USER_LAST_SEEN:{
    type: Date,
    defaultValue: null
  },
  DN_USER_DETAILS:STRING
}, {
    timestamps: false,
    underscore: true
  });

module.exports = User;
