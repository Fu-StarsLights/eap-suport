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
 * LastEditTime : 2023-03-28 17:47:09
 */
const fs = require('fs')
const path = require('path')
const { program } = require('commander')
const inquirer = require('inquirer')

const eap = require('./libs/eap')
const ftp = require('./libs/ftp')
const output = require('./libs/output')
const config = require('../config.json')
const cauth = require('./libs/cauth')
// 解析参数
program.option('-r,--restart', 'Automatic opening')
program.option('-cfg,--config', 'show config')
program.option('-t,--token <token>', 'set user token, If you enter update, the token is automatically refreshed.  The password is required')
program.option('-pwd,--password <password>', 'set device safe password')
program.option('-c,--copy <remove path>','copy Directory to the remote directory')
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

  // 自动更新token
  if (options.token === 'update') {
    if (config.devPwd) {
      eap.getToken(config.devPwd).then(data => {
        if (data.token) {
          config.token = data.token
          console.log("[esport] Token Update:",data.token)
          saveConfig(config)
          process.exit()
        }
      })
    } else {
      console.log("[esport] 未设置 devpwd")
    }
    return
  } else {
    config.token = options.token
    saveConfig(config)
    process.exit()
  }
}


// 设置安全密码
if (options.password) {
  config.devPwd = options.password
  saveConfig(config)
  process.exit()
}


// 远程copy文件夹
if(options.copy){
  ftp.rmCopy(null,options.copy)
  return
}




//  重新启动
let autoOpenEap = false
if (options.restart) {
  autoOpenEap = true
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
    if (data.eapNum >= 100) {
      await cauth.startAuth(data.eapNum)
    }
  }

  if (data.console === 'true') {
    await output.connect()
  }

  if (autoOpenEap) {
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

