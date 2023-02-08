const FtpDeploy = require('ftp-deploy')
const fs = require('fs')
const path = require('path')
const cfg= require('../../config.json')

const ftpDeploy = new FtpDeploy();


ftpDeploy.on("uploading", function (data) {
    console.log("FTP UPLOADING:", data.totalFilesCount, data.transferredFileCount, data.filename);
});
ftpDeploy.on("uploaded", function (data) {
    // console.log("FTP UPLOADED:",data.totalFilesCount,data.transferredFileCount,data.filename); 
});
ftpDeploy.on("log", function (data) {
    // console.log('FTP LOG:', data);
});
ftpDeploy.on("upload-error", function (data) {
    console.log('FTP UPLOAD ERROR:', data.err);
});



async function run(eapNum,uninstall) {
    const config = {
        user: "root",
        password: "root",
        host: cfg.edgerosAddr,
        port: 21,
        localRoot: path.join(process.cwd(), 'eap-suport-demo'),
        remoteRoot: "/root",
        include: ["*"],
        exclude: [],
        deleteRemote: uninstall,
        forcePasv: true,
        sftp: false,
    };


    config.remoteRoot = path.join('/apps/eos/apps', eapNum.toString())
    config.localRoot = process.cwd()

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

module.exports = {
    run
}