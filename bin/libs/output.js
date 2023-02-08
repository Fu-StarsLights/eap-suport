/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-02 12:36:28
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-02-08 18:46:09
 */
const { Telnet } = require('telnet-client');
const { stdin, stdout } = require('process')
const cfg = require('../../config.json')

async function connect() {
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
        stdout.write(data)
    })

    connection.on('error', (err) => {
        console.log('error:', err)
    })

    connection.on('connect', () => {
        console.log('-----------------终端已开启-----------------')
    })


    connection.connect(params)
}

module.exports = {
    connect
}