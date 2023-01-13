const {
  Sequelize,
  INTEGER,
  STRING,
  VIRTUAL,
  DATE,
  BOOLEAN,
  UUID,
} = require('sequelize');
const db = require('./_db');
const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

const BlockedUserRecord = db.define(
  'tbl_cu_block_user',
  {
    DN_ID: {
      //DN_ID => DN_ID
      allowNull: false,
      autoIncrement: true,
      type: UUID,
      primaryKey: true,
    },
    DD_CREATED_ON: {
      //T_Block_User_Created_On => DD_CREATED_ON
      type: Date,
      defaultValue: currentTime,
    },
    block: {
      type: BOOLEAN,
    },
    blockuser: STRING,
    loginuser: {
      type: UUID,
    },
  },
  {
    timestamps: false,
    underscore: true,
    freezeTableName: true,
  }
);

module.exports = BlockedUserRecord;
