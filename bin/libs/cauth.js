/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-23 18:53:17
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-02-24 12:11:26
 */
 const path = require('path')
 const { Telnet } = require('telnet-client');
 const config = require('../../config.json')
 
 /**
  * 检查路径中的所有文件夹
  * @param {*} connection 
  * @param {*} folderPath 
  * @param {*} folderPathArr 
  */
 async function scanFolder(connection, folderPath,folderPathArr) {
     folderPathArr.push(folderPath)
     let cmdReq = await connection.exec(`cd ${folderPath}`)
     cmdReq = await connection.exec(`ll`)
     
     let cmd = cmdReq.replace(_ansiRegex(), '')
     let cmdArray = cmd.split('\n')
     for (let cmdStr of cmdArray) {
         if (/^d/g.test(cmdStr)) {
             const arrayItem = cmdStr.split(' ')
             const folderName = arrayItem[arrayItem.length - 1].trim()
             await scanFolder(connection,path.join( folderPath, folderName).replaceAll(path.sep,'/'),folderPathArr)
         }
     }
 }
 
 
 
 /**
  * 授权所有目录
  * @param {*} folderPath 
  */
 async function impowerAll(connection,folderPath){
     let cmdReq = await connection.exec(`cd ${folderPath}`)
     cmdReq = await connection.exec(`chmod 777 *`)
 }
 
 
 /**
  * 消除字符串的终端控制符
  * @param {*} param0 
  * @returns 
  */
 function _ansiRegex() {
     const pattern = [
         '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
         '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
     ].join('|')
     return new RegExp(pattern, 'gim')
 }
 
 /**
  * 文件授权
  * @param {*} eapNum
  */
 async function startAuth(eapNum) {
     const params = {
         host: config.edgerosAddr,
         port: 23,
         timeout: 1500,
         username: 'root',
         password: 'root'
     }

     const connection = new Telnet()
     connection.on('close', () => {
        //  console.log('connection closed')
     })
     connection.on('ready', (prompt) => {
        // console.log('connection ready')
      })

     await connection.connect(params)
     const basePath = `/apps/eos/apps/${eapNum}/program/`
     // folder check
     const folderPathArr = []
     await scanFolder(connection, basePath,folderPathArr)
     // auth
     for(let folderPath of folderPathArr){
         console.log("\x1B[33m%s\x1B[36m%s\x1B[0m","CAUTH:",folderPath)
         await impowerAll(connection,folderPath)
     }
     
     connection.end()
 }
 
 
 module.exports={
     startAuth
 }
 
 