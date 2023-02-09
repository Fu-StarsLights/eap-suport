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
 * LastEditTime : 2023-02-09 13:11:48
 */
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const eap = require('./libs/eap')
const { program } = require('commander')
const ftp = require('./libs/ftp')
const output = require('./libs/output')
const config = require('../config.json')

// 解析参数
program.option('-r,--restart', 'Automatic opening')
program.option('-cfg,--config', 'show config')
program.option('-t,--token <token>', 'set user token')
program.parse(process.argv);
const options = program.opts();

// 展示配置信息
if (options.config) {
  Object.keys(config).forEach(key => {
    console.log(key, ":", config[key])
  })
  process.exit()
}

// 设置token
if (options.token) {
  config.token = options.token
  saveConfig(config)
  process.exit()
}

//  重新启动
let autoOpenEap = false
if(options.restart){
  autoOpenEap=true
}

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
    message: '是否卸载目标目录',
    name: 'uninstall',
    type: 'list',
    choices: ['false', 'true']
  }, {
    message: '是否开启终端',
    name: 'console',
    type: 'list',
    choices: ['true', 'false']
  }
]).then(async data => {
  config.eapNum = data.eapNum
  saveConfig(config)

  if (data.eapNum !== 0) {
    await ftp.run(data.eapNum, data.uninstall === 'true')
  }

  if (data.console === 'true') {
    await output.connect()
  }

  if(autoOpenEap){
    await eap.restart()
   }
   
}).catch(err => {
  console.log("eport 运行失败", err)
})


/**
 * 修改config
 * @param {*} config 
 */
function saveConfig(config) {
  fs.writeFileSync(path.join(__dirname, '../config.json'), JSON.stringify(config, null, 4))
}