const { ipcRenderer } = require('electron')

function loginUser() {
    let userId = document.getElementById('studentId').value
    let userPwd = document.getElementById('studentPwd').value
    document.getElementById('loginBtn').classList.add("is-loading");
    ipcRenderer.send('login-user-function', userId, userPwd)
}

function loginFail(params) {
    alert('帳號密碼錯誤');
    document.getElementById('loginBtn').classList.remove("is-loading");
}

function loginSuccess(params) {
    document.getElementById('loginBtn').classList.remove("is-loading");
    document.getElementById('loginBtn').classList.remove("is-info");
    document.getElementById('loginBtn').classList.add("is-success");
    document.getElementById('loginBtn').innerHTML = "登入成功";
    document.getElementById('loginBtn').disabled = true;
    document.getElementById('startRunBtn').disabled = false;
    document.getElementById('courseID1').disabled = false;
}

function startRun(params){
    let userCourseId = document.getElementById('courseID1').value
    ipcRenderer.send('start-run-function', userCourseId)

    document.getElementById('courseID1').disabled = true;
    document.getElementById('startRunBtn').disabled = true;
    document.getElementById('endRunBtn').disabled = false;
}

function endRun(params) {
    ipcRenderer.send('end-run-function')

    document.getElementById('courseID1').disabled = false;
    document.getElementById('startRunBtn').disabled = false;
    document.getElementById('endRunBtn').disabled = true;
}

function completeChoose(params){
    alert("加選成功！請到選課網站確認！感謝您的使用！\n\nAuthor By tico88612")

    document.getElementById('courseID1').disabled = false;
    document.getElementById('startRunBtn').disabled = false;
    document.getElementById('endRunBtn').disabled = true;
}

ipcRenderer.on('login-Fail-Alert', loginFail)
ipcRenderer.on('login-Success-Alert', loginSuccess)
ipcRenderer.on('complete-choose', completeChoose)