/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-09 12:29:03
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-03-24 14:10:26
 */
const axios = require('axios')
const https = require('https')
const config = require('../../config.json')
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0 // 禁用https 证书验证的另一个方法
async function turnON() {
    try {
        // 发起一个post请求
        const data = await axios({
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
        console.log("[*] 开启EAP", config.eapNum, data.status, data.data)
    } catch (err) {
        console.log("[*] 开启EAP Error:", err.message)
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
        console.log("[*] 关闭EAP", config.eapNum, data.status, data.data)
    } catch (err) {
        console.log("[*] 关闭EAP Error:", err.message)
    }
}

/**
 * 获取token
 * @param {*} devPwd 
 * @returns 
 */
async function getToken(devPwd) {

    try {
        const res = await axios({
            method: 'POST',
            url: `https://${config.edgerosAddr}/secure/login`,
            data: {
                password: devPwd,
                token: null
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true
            })
        })

        return res.data
    } catch (err) {
        console.log('[esport] Update Token Error:', err.message,err.response.data)
        return {}
    }
}

/**
 * 重启
 */
async function restart() {
    if (config.eapNum === 0) { return }
    await turnOFF()
    setTimeout(async () => {
        await turnON()
    }, 2000);
}


module.exports = {
    turnOFF,
    turnON,
    restart,
    getToken
}