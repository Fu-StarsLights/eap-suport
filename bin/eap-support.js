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
 * LastEditTime : 2023-02-08 18:33:40
 */
const program = require('commander')
const fs = require('fs')
const path =require('path')
const inquirer = require('inquirer')
const ftp = require('./libs/ftp')
const output = require('./libs/output')
const config =require('../config.json')

/**
 * EAP 特权 EAP 开发流程
 */
inquirer.prompt([
  {
    message: 'Eap 文件编号(默认不上传)',
    name: 'eapNum',
    type: 'number',
    default: config.eapNum
  }, {
    message: '是否开启终端',
    name: 'console',
    type: 'list',
    choices: ['true', 'false']
  }, {
    message: '是否卸载目标目录',
    name: 'uninstall',
    type: 'list',
    choices: ['false', 'true']
  }
]).then(async data => {
  config.eapNum = data.eapNum
  fs.writeFileSync(path.join(__dirname,'../config.json'),JSON.stringify(config,null,4))

  if (data.eapNum !== 0) {
    await ftp.run(data.eapNum,data.uninstall==='true')
  }
  if (data.console === 'true') {
    await output.connect()
  }

}).catch(err => {
  console.log("eport 运行失败", err)
})