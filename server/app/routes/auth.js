const router = require('express').Router();
const passport = require('passport');
const User = require('../../model/user');
const querystring = require('querystring');
const request = require('request');
const config = require('../../../config/configuration');
const rp = require('request-promise');


module.exports = {
  authUser: authUser
};

function authUser(req, res, next) {
  // request({
  //   headers: {
  //     'Authorization': req.headers['authorization']
  //   },
  //   uri: config.ValidateAccessTokenURL,
  //   method: 'GET'
  // }, function (err, response, body) {
  //   if (response.statusCode == 200) {
  //     next();
  //   } else if (response.statusCode == 401) {
  //     res.status(400).send({ "status": "Failed", statusCode: 400, error: 'Invalid token' });
  //   }
  // });

  console.log('headers',  req.headers['authorization']);
  rp({
    url: config.DeelchatAPI+"deelChat/viewchatprofile",
    headers: {
      'Authorization': req.headers['authorization'],//"bearer 6ffd36c9-865c-4a96-ae23-d9f54f92f993",
      'Content-type': 'application/json',
  },
    method: 'GET',
}).then((response) => {
      next()
      return response
    }).catch(e=>{
      // console.log(JSON.parse(JSON.stringify(e)))
      console.log('Invalid token' )
      res.status(401).send(e);
    });

}
