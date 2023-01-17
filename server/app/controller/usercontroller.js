const BlockedUserRecord = require('../../model/blockedRecord');

async function getBlockedStatus(roomName) {
  const [sender, receiver] = roomName?.split('&');

  try {
    const response = await BlockedUserRecord.findOne({
      where: { loginuser: sender, blockuser: receiver },
    });

    if (!response) return false;

    return response.dataValues?.block ? true : false;
  } catch (error) {
    console.log('getBlockedStatus--error', error);
    return false;
  }
}

module.exports = { getBlockedStatus };
