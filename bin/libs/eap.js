const axios = require('axios')
const https = require('https')
const config = require('../../config.json')
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0 // 禁用https 证书验证的另一个方法
async function turnON() {
    try {
        // 发起一个post请求
        const data =await axios({
            method: 'post',
            url: `https://${config.edgerosAddr}/api/apps/launch/${config.eapNum}`,
            data: {},
            headers: {
                Authorization: config.token
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true
            })
        });
        console.log("[*] 开启EAP",config.eapNum, data.status, data.data)
    } catch (err) {
        console.log("turn on:", err)
    }
}


async function turnOFF() {
    try {
        const data = await axios({
            method: 'POST',
            url: `https://${config.edgerosAddr}/api/apps/kill/${config.eapNum}?launchTime=${new Date().getTime()}`,
            headers: {
                Authorization: config.token
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true
            })
        })
        console.log("[*] 关闭EAP",config.eapNum, data.status, data.data)
    } catch (err) {
        console.log("turn off:", err)
    }
}


/**
 * 重启
 */
async function restart() {
    await turnOFF()
    setTimeout(async () => {
        await turnON()
    }, 2000);
}


module.exports = {
    turnOFF,
    turnON,
    restart
}