const { ipcRenderer } = require('electron')

function updateCount(event, arg) {
    document.getElementById('count').innerText = arg
}

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
}

function startRun(params){
    
}
ipcRenderer.on('login-Fail-Alert', loginFail)
ipcRenderer.on('login-Success-Alert', loginSuccess)