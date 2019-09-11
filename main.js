// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const log = require('electron-log');
log.transports.console.level = 'info';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    icon: path.join(__dirname, 'icon/apple.icns'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const { ipcMain } = require('electron')
const rp = require('request-promise')
const querystring = require('querystring')

let __EVENTTARGET = "", __EVENTARGUMENT = "", __VIEWSTATE = "", __VIEWSTATEENCRYPTED = "", __EVENTVALIDATION = ""
let userId = "", userPwd = "", userCourseId = ""
let userCookie = ""
let setIntervalCode = ""

ipcMain.on('login-user-function', startSession)
ipcMain.on('start-run-function', startSetInteval)
ipcMain.on('end-run-function', endSetInteval)

async function startSession(event, arg1, arg2) {
  log.info("startSession Function START");

  userId = arg1
  userPwd = arg2
  log.debug("userId: %s", userId);
  log.debug("userPwd: %s", userPwd);

  log.info("GET Choose Course System Data START");
  let htmlResponse = await useRequestPromise({
    uri: "http://203.64.78.174/ScasWebSite/Default.aspx",
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    simple: false
  });
  curlParseASPX(htmlResponse)
  log.info("GET Choose Course System Data END");
  
  log.info("Make POST Body Data START");
  let form = {
    "__EVENTTARGET": __EVENTTARGET,
    "__EVENTARGUMENT": __EVENTARGUMENT,
    "__VIEWSTATE": __VIEWSTATE,
    "__EVENTVALIDATION": __EVENTVALIDATION,
    "logUser$UserName": userId,
    "logUser$Password": userPwd,
    "logUser$LoginButton": "登　入"
  }
  let formData = querystring.stringify(form);
  let formDataLength = formData.length;
  log.debug("FormData: %s", formData);
  log.debug("FormData - length: %d", formDataLength);
  log.info("Make POST Body Data END");

  log.info("POST Choose Course System Data START");
  htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie,
      'Content-length': formDataLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: "http://203.64.78.174/ScasWebSite/Default.aspx",
    method: "POST",
    body: formData,
    timeout: 30000,
    resolveWithFullResponse: true,
    maxRedirects: 10,
    simple: false
  });

  if (htmlResponse.statusCode === 302 && htmlResponse.body.indexOf('SelectAddCode.aspx') > -1){
    log.info("Login Successful!")
    event.sender.send('login-Success-Alert')
  }
  else{
    log.info("Login Failure!")
    event.sender.send('login-Fail-Alert')
  }

  log.info("startSession Function END");
}

function startSetInteval(event, arg1) {
  log.info("startSetInteval Function START");
  userCourseId = arg1
  runToRushCourse(event);
  setIntervalCode = setInterval(runToRushCourse, 60000, event);
  log.info("startSetInteval Function END");
}

function endSetInteval(){
  log.info("endSetInteval Function START");
  clearInterval(setIntervalCode);
  log.info("endSetInteval Function END");
}

async function restartSession(){
  log.info("restartSession Function START");

  log.info("restartSession GET Choose Course System Data START");
  let htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie
    },
    uri: "http://203.64.78.174/ScasWebSite/Default.aspx",
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    simple: false
  });
  curlParseASPX(htmlResponse)
  log.info("restartSession GET Choose Course System Data END");

  log.info("restartSession Make POST Body Data START");
  let form = {
    "__EVENTTARGET": __EVENTTARGET,
    "__EVENTARGUMENT": __EVENTARGUMENT,
    "__VIEWSTATE": __VIEWSTATE,
    "__EVENTVALIDATION": __EVENTVALIDATION,
    "logUser$UserName": userId,
    "logUser$Password": userPwd,
    "logUser$LoginButton": "登　入"
  }
  let formData = querystring.stringify(form);
  let formDataLength = formData.length;
  log.debug("FormData: %s", formData);
  log.debug("FormData - length: %d", formDataLength);
  log.info("restartSession Make POST Body Data END");

  log.info("restartSession POST Choose Course System Data START");
  htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie,
      'Content-length': formDataLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: "http://203.64.78.174/ScasWebSite/Default.aspx",
    method: "POST",
    body: formData,
    timeout: 30000,
    resolveWithFullResponse: true,
    maxRedirects: 10,
    simple: false
  });

  if (htmlResponse.statusCode === 302 && htmlResponse.body.indexOf('SelectAddCode.aspx') > -1) {
    log.info("Login Successful!")
  }
  else {
    log.info("Login Failure!")
    event.sender.send('login-Fail-Alert')
  }
  log.info("restartSession POST Choose Course System Data END");

  log.info("restartSession Function END");
}

async function runToRushCourse(event) {
  log.info("runToRushCourse Function START");

  log.info("GET Choose Course System SelectAddCode.aspx START");
  let htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie
    },
    uri: "http://203.64.78.174/ScasWebSite/SelectAddCode.aspx",
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    simple: false
  });
  if (htmlResponse.indexOf('Object moved') > -1){
    await restartSession();
    htmlResponse = await useRequestPromise({
      headers: {
        'Cookie': userCookie
      },
      uri: "http://203.64.78.174/ScasWebSite/SelectAddCode.aspx",
      timeout: 30000,
      followRedirect: true,
      maxRedirects: 10,
      simple: false
    });
  }
  curlParseASPX(htmlResponse)
  log.info("GET Choose Course System SelectAddCode.aspx END");

  log.info("MAKE POST Query START");
  let form = {
    "__EVENTTARGET": __EVENTTARGET,
    "__EVENTARGUMENT": __EVENTARGUMENT,
    "__VIEWSTATE": __VIEWSTATE,
    "__VIEWSTATEENCRYPTED": __VIEWSTATEENCRYPTED,
    "__EVENTVALIDATION": __EVENTVALIDATION,
    "ctl00$hidBookMarker": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode0": userCourseId,
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode1": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode2": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode3": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode4": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode5": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$btnQuery": "查詢"
  }
  let formData = querystring.stringify(form);
  let formDataLength = formData.length;
  log.debug("FormData: %s", formData);
  log.debug("FormData - length: %d", formDataLength);
  log.info("MAKE POST Query END");

  log.info("POST Choose Course System SelectAddCode.aspx Query START");
  htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie,
      'Content-length': formDataLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: "http://203.64.78.174/ScasWebSite/SelectAddCode.aspx",
    method: "POST",
    body: formData,
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    simple: false
  });
  curlParseASPX(htmlResponse)
  log.info("POST Choose Course System SelectAddCode.aspx Query END");

  log.info("MAKE POST Choose START");
  form = {
    "__EVENTTARGET": "ctl00$ContentPlaceHolder1$WcClassListSelect1$gvStepFullClassList$ctl03$btnAdd",
    "__EVENTARGUMENT": __EVENTARGUMENT,
    "__VIEWSTATE": __VIEWSTATE,
    "__VIEWSTATEENCRYPTED": __VIEWSTATEENCRYPTED,
    "__EVENTVALIDATION": __EVENTVALIDATION,
    "ctl00$hidBookMarker": "ctl00_ContentPlaceHolder1_WcClassListSelect1_gvStepFullClassList_ctl03_btnAdd",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode0": userCourseId,
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode1": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode2": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode3": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode4": "",
    "ctl00$ContentPlaceHolder1$WcClassAddSwitch1$WcClassQueryCode1$txtCode5": "",
  }
  formData = querystring.stringify(form);
  formDataLength = formData.length;
  log.debug("FormData: %s", formData);
  log.debug("FormData - length: %d", formDataLength);
  log.info("MAKE POST Choose END");

  log.info("POST Choose Course System SelectAddCode.aspx Choose START");
  htmlResponse = await useRequestPromise({
    headers: {
      'Cookie': userCookie,
      'Content-length': formDataLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: "http://203.64.78.174/ScasWebSite/SelectAddCode.aspx",
    method: "POST",
    body: formData,
    timeout: 30000,
    followRedirect: true,
    maxRedirects: 10,
    simple: false
  });
  if (htmlResponse.toString().indexOf('加選成功！') > -1){
    endSetInteval();
    event.sender.send('complete-choose')
  }
  log.info("POST Choose Course System SelectAddCode.aspx Choose END");

  log.info("runToRushCourse Function END");
}

function curlParseASPX(body){
  log.info("curlParseASPX Function START");
  
  let arr;
  body = body.replace(/(\r\n|\n|\r|\s)/gm, '')
  arr = body.toString().split("id=\"__EVENTTARGET\"value=\"")
  if (arr.length >= 2){
    arr = arr[1];
    arr = arr.toString().split("\"/>");
    __EVENTTARGET = arr[0];
  }
  else{
    __EVENTTARGET = "";
  }
  log.debug("__EVENTTARGET: %s", __EVENTTARGET);

  arr = body.toString().split("id=\"__EVENTARGUMENT\"value=\"")
  if (arr.length >= 2) {
    arr = arr[1];
    arr = arr.toString().split("\"/>");
    __EVENTARGUMENT = arr[0];
  }
  else{
    __EVENTARGUMENT = "";
  }
  log.debug("__EVENTARGUMENT: %s", __EVENTARGUMENT);

  arr = body.toString().split("id=\"__VIEWSTATE\"value=\"")
  if (arr.length >= 2) {
    arr = arr[1];
    arr = arr.toString().split("\"/>");
    __VIEWSTATE = arr[0];
  }
  else{
    __VIEWSTATE = "";
  }
  log.debug("__VIEWSTATE: %s", __VIEWSTATE);


  arr = body.toString().split("id=\"__VIEWSTATEENCRYPTED\"value=\"")
  if (arr.length >= 2) {
    arr = arr[1];
    arr = arr.toString().split("\"/>");
    __VIEWSTATEENCRYPTED = arr[0];
  }
  else {
    __VIEWSTATEENCRYPTED = "";
  }
  log.debug("__VIEWSTATEENCRYPTED: %s", __VIEWSTATEENCRYPTED);


  arr = body.toString().split("id=\"__EVENTVALIDATION\"value=\"")
  if (arr.length >= 2) {
    arr = arr[1];
    arr = arr.toString().split("\"/>");
    __EVENTVALIDATION = arr[0];
  }
  else {
    __EVENTVALIDATION = "";
  }
  log.debug("__EVENTVALIDATION: %s", __EVENTVALIDATION);

  log.info("curlParseASPX Function END");
}

async function useRequestPromise(options) {
  let rpbody = await rp(options, function (error, response, body) {
    if (error !== null) {
      log.error(error)
    }
    else {
      if (response.headers["set-cookie"]) {
        userCookie += response.headers["set-cookie"][0]
      }
    }

  });
  return rpbody;
}
