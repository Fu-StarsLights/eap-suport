/**
 * Copyright (c) 2022 EdgerOS Team.
 * All rights reserved.
 * 
 * Detailed license information can be found in the LICENSE file.
 * 
 * Author       : Fu Wenhao <fuwenhao@acoinfo.com>
 * Date         : 2023-02-02 11:36:31
 * LastEditors  : Fu Wenhao <fuwenhao@acoinfo.com>
 * LastEditTime : 2023-03-28 17:49:14
 */
const FtpDeploy = require('ftp-deploy')
const fs = require('fs')
const path = require('path')
const cfg = require('../../config.json')

const ftpDeploy = new FtpDeploy();


ftpDeploy.on("uploading", function (data) {
    console.log("\x1B[32m%s\x1B[36m%s\x1B[0m", "UPLOADING:", `${data.totalFilesCount} ${data.transferredFileCount + 1} ${data.filename}`);
});
ftpDeploy.on("uploaded", function (data) {
    // console.log("FTP UPLOADED:",data.totalFilesCount,data.transferredFileCount,data.filename); 
});
ftpDeploy.on("log", function (data) {
    // console.log('FTP LOG:', data);
});
ftpDeploy.on("upload-error", function (data) {
    console.log('UPLOAD ERROR:', data.err);
});


const config = {
    user: "root",
    password: "root",
    host: cfg.edgerosAddr,
    port: 21,
    localRoot: path.join(process.cwd(), 'eap-suport-demo'),
    remoteRoot: "/root",
    include: ["*"],
    exclude: [],
    deleteRemote: false,
    forcePasv: true,
    sftp: false,
};



/**
 * 安装应用
 * @param {number} eapNum 应用编号
 * @param {boolean} uninstall 是否删除原始应用
 */
async function run(eapNum, uninstall) {

    config.remoteRoot = path.join('/apps/eos/apps', eapNum.toString())
    config.localRoot = process.cwd()
    config.deleteRemote = uninstall

    const dirInfos = fs.readdirSync(config.localRoot)
    let program = false
    let descJson = false
    dirInfos.forEach((dirname) => {
        if (dirname === 'program') { program = true }
        if (dirname === 'desc.json') { descJson = true }
    })

    if (program && descJson) {
        console.log('-----------------开始同步文件-----------------')
        try {
            await ftpDeploy.deploy(config)
        } catch (err) {
            console.log('FtpUpload Error:', err)
        }
    } else {
        throw new Error('当前目录下未找到 program 或 desc.json 标识文件')
    }
}



/**
 * 本地文件copy到远端
 * @param {string} localPath // 本地文件路径 
 * @param {string} RemotePath // 远端文件路径
 */
async function rmCopy(localPath, RemotePath) {
    config.remoteRoot = path.join(RemotePath)
    config.localRoot = localPath || process.cwd()
    config.deleteRemote = false
    await ftpDeploy.deploy(config)
    return
}

/**
 * 实时同步文件到远端
 */
async function syncFile(RemotePath) {
    const basePath = process.cwd()
    const fileChangeSet = new Set()

    fs.watch(process.cwd(), { recursive: true }, async (eventType, filename) => {
        fileChangeSet.add(filename)
    })


    function _syncFtp() {
        if (fileChangeSet.size === 0) { setTimeout(() => { _syncFtp() }, 1000) }
        for (let filePath of fileChangeSet) {
            const localFilePath = path.join(basePath, filePath)
            const fileBasePath = path.dirname(filePath)
            const fileName = path.basename(filePath)

            const fsStat = fs.statSync(localFilePath, { throwIfNoEntry: false })

            if (fsStat && fsStat.isFile()) {
                const config = {
                    user: "root",
                    password: "root",
                    host: cfg.edgerosAddr,
                    port: 21,
                    localRoot: path.join(basePath, fileBasePath),
                    remoteRoot: path.join(RemotePath, fileBasePath),
                    include: [fileName],
                    exclude: [],
                    deleteRemote: false,
                    forcePasv: true,
                    sftp: false,
                }

                ftpDeploy.deploy(config).then((res) => {
                    console.log("文件同步:", localFilePath, '->', path.join(RemotePath, filePath))
                }).catch(err => {
                    console.log("文件同步失败:", localFilePath)
                }).finally(() => {
                    setTimeout(() => { _syncFtp() }, 1000)
                })
            } else {
                setTimeout(() => { _syncFtp() }, 1000)
            }

            fileChangeSet.delete(filePath)
        }
    }

    _syncFtp()
}




module.exports = {
    run,
    rmCopy,
    syncFile
}