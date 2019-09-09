const { ipcRenderer } = require('electron')
function updateCount(event, arg) {
    document.getElementById('count').innerText = arg
}
function loginUser() {
    let userId = document.getElementById('studentId').value
    let userPwd = document.getElementById('studentPwd').value
    ipcRenderer.send('login-user-function', userId, userPwd)
}
ipcRenderer.on('res-count', updateCount)