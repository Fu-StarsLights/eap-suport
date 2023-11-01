/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-02 12:36:28
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-02-10 11:34:21
 */
const { Telnet } = require('telnet-client');
const { stdin, stdout } = require('process')
const cfg = require('../../config.json')
const { Writable } = require('stream')

/**
 * @param {string} logStr 标记log
 */
async function connect(logTag) {
    const connection = new Telnet()
    const params = {
        host: cfg.edgerosAddr,
        port: '81',
        shellPrompt: false,
        negotiationMandatory: true,
        timeout: 1500
    }

    connection.on('ready', prompt => {
        console.log('telnet connect success:', prompt)
    })

    connection.on('close', () => {
        console.log('connection closed')
    })

    connection.on('data', (data) => {
        const dataStr = data.toString()
        if (logTag) {
            if (dataStr.includes(logTag)) {
                stdout.write(dataStr)
            }
        } else {
            stdout.write(dataStr)
        }
    })

    connection.on('error', (err) => {
        console.log('error:', err)
    })

    connection.on('connect', () => {
        console.log('-----------------终端已开启-----------------')

        // 监听输入设备流
        const writeStream = new Writable({
            write: function (chunk, encoding, callback) {
                // console.log('msg:', chunk.toString())
                callback()
            },
            writev: function (chunks, callback) {
                // console.log('msgev:', chunk.toString())
                callback()
            }
        })
        stdin.pipe(writeStream)
    })

    connection.connect(params)
}




module.exports = {
    connect
}