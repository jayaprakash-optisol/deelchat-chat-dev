//===============================================================================================
// production client database & server

//  let databaseDetails={
//   host:"deelchat-prod.closllukawva.ap-south-1.rds.amazonaws.com",
//   username:"optisol",
//   password:"Opt!dev_$%^_!@#",
//   Cloud_front_URL:"http://d2cs5y0rgi3xe5.cloudfront.net/"
// }

// staging

// let databaseName="deelchat"
// let DeelchatAPI = "http://13.234.16.245:9080/"
// let erpBaseUrl = "http://13.234.16.245:9001"
// let apiPort = process.env.PORT ? process.env.PORT : 9001;
// let authUrl = process.env.AUTH_URL ? process.env.AUTH_URL : "http://13.234.16.245:9001";//localhost:9001

//===========================================================================
// client server development and test details

let databaseDetails = {
  host: '52.66.180.172',
  username: 'optisol',
  password: 'Opt!dev_$%^_!@#',
  Cloud_front_URL: 'http://dvg7tg4sfdqst.cloudfront.net/',
};

// testing

let databaseName = 'deelchat';
let DeelchatAPI = 'http://52.66.180.172:9070/';
let erpBaseUrl = 'http://52.66.180.172:9002';
let apiPort = process.env.PORT ? process.env.PORT : 9002;
let authUrl = process.env.AUTH_URL
  ? process.env.AUTH_URL
  : 'http://52.66.180.172:9002'; //localhost:9001

// development

// let databaseName="deelchatdev"
// let DeelchatAPI = "http://52.66.180.172:9060/"
// let erpBaseUrl = "http://52.66.180.172:9003"
// let apiPort = process.env.PORT ? process.env.PORT : 9003;
// let authUrl = process.env.AUTH_URL ? process.env.AUTH_URL : "http://52.66.180.172:9003";//localhost:9001

//===================================================================================================

//optisol database & server

// let databaseDetails = {
//   host: '34.218.121.25',
//   username: 'root',
//   dialect: 'mysql',
//   password: 'db@dm1n',
//   Cloud_front_URL: 'http://d2h1ntqk5w5n1u.cloudfront.net/',
// };

// developmentdb name deelchatdev

// let databaseName="deelchatdev"
// let DeelchatAPI = "http://34.218.121.25:9060/"
// let erpBaseUrl = "http://54.173.185.173:9003"
// let apiPort = process.env.PORT ? process.env.PORT : 9003;
// let authUrl = process.env.AUTH_URL ? process.env.AUTH_URL : "http://54.173.185.173:9003";//localhost:9001

//  Testing db name deelchat

// let databaseName="deelchat"
// let DeelchatAPI = "http://34.218.121.25:9070/"
// let erpBaseUrl = "http://54.173.185.173:9002"
// let apiPort = process.env.PORT ? process.env.PORT : 9002;
// let authUrl = process.env.AUTH_URL ? process.env.AUTH_URL : "http://54.173.185.173:9002";//localhost:9001

//Staging db name deelchattest

// let databaseName="deelchattest"
// let DeelchatAPI = "http://34.218.121.25:9080/"
// let erpBaseUrl = "http://54.173.185.173:9001"
// let apiPort = process.env.PORT ? process.env.PORT : 9001;
// let authUrl = process.env.AUTH_URL ? process.env.AUTH_URL : "http://54.173.185.173:9001";//localhost:9001

//======================================================================================================

let data = {
  sharePoint: {
    username: 'jp_sharan',
    password: 'sha_moni_12345',
    domain: 'ecc-web',
    ModuleName: 'ConVerse',
    ImageDocumentType: 'ChatImage',
    DocumentType: 'ChatDocs',
    SiteUrl: 'http://appqltydocs.lntecc.com/gn/Deelchat/',
    uploadURL: 'http://moss2013-dev/Deelchat/api/SPDU/GetSPDUData',
  },
  ERPToken: {
    ClientID: '1666',
    SecretKey: '5515957151157759515917575',
    CompanyCode: '1',
    validateTokenURL:
      erpBaseUrl +
      'EIPAccessControlAPI/EIPACSAuthenticationAPI/ACSAPI/EIP/ValidateToken',
    generateTokenURL:
      erpBaseUrl + 'EIPAccessControlAPI/ACSAPI/ONM/GetGenerateToken',
  },
  ValidateAccessTokenURL:
    authUrl + 'ConverseAPI/api/Account/ValidateAccessToken',
  AWS_cloud_front: databaseDetails.Cloud_front_URL, //"http://d2h1ntqk5w5n1u.cloudfront.net/"
};

module.exports = {
  apiPort,
  authUrl,
  data,
  DeelchatAPI,
  databaseName,
  databaseDetails,
};
