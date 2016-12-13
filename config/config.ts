﻿let devApi = "http://smelink.animation-genius.com:3002";
let masterApi = "http://203.148.250.152:3002";

const config = {
  api: {
    authen: `${devApi}/api/authenticate/verify`
  },
  chatDB: "mongodb://git.animation-genius.com:27017/smelink-chat",
  fileDB: "",
  port: 80,
  timeout: 10000,
  webserver: "http://git.animation-genius.com",

  pushServer: "smelink.animation-genius.com",
  ParseApplicationId: "newSMELink",
  ParseRESTAPIKey: "link1234",
  ParseMasterKey: "link1234",
  pushPort: 4040,
  pushPath: "/parse/push",
  session: {
    expire: "1 days",
    secret: "ahoostudio_session_secret"
  }
}

const masterConfig = {
  api: {
    authen: `${masterApi}/api/authenticate/verify`
  },
  chatDB: "mongodb://chats:chats1234@smelink.animation-genius.com:27017/chats",
  fileDB: "",
  port: 80,
  timeout: 10000,
  webserver: "http://git.animation-genius.com",

  pushServer: "smelink.animation-genius.com",
  ParseApplicationId: "newSMELink",
  ParseRESTAPIKey: "link1234",
  ParseMasterKey: "link1234",
  pushPort: 4040,
  pushPath: "/parse/push",
  session: {
    expire: "1 days",
    secret: "ahoostudio_session_secret"
  }
}

function getConfig() {
  // let conf = (process.env.NODE_ENV === `production`) ? masterConfig : config;
  // console.log(process.env.NODE_ENV, conf.chatDB);

  return masterConfig;
}

export const Config = getConfig();