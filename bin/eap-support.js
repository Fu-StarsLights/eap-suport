#!/usr/bin/env node

/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-02 10:25:19
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-02-02 13:12:47
 */
const program = require('commander')
const inquirer = require('inquirer')
const ftp = require('./libs/ftp')
const output = require('./libs/output')

/**
 * EAP 特权 EAP 开发流程
 */
inquirer.prompt([
  {
    message: 'Eap 文件编号(默认不上传)',
    name: 'eapNum',
    type: 'number',
    default: 0
  }, {
    message: '是否开启终端',
    name: 'console',
    type: 'list',
    choices: ['true', 'false']
  }
]).then(async data => {
  if (data.eapNum !== 0) {
    await ftp.run(data.eapNum)
  }
  if (data.console === 'true') {
    await output.connect()
  }

}).catch(err => {
  console.log("eport 运行失败", err)
})