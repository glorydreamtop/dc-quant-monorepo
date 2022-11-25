/**定义模块和变量**/
const execSync = require('child_process').execSync; //同步子进程
const fs = require('fs'); //文件读取模块
const versionPath = 'version.txt'; //version路径
const commit = execSync('git show -s --format=%H').toString().trim(); //当前提交的版本号

function getVersion() {
  const now = new Date();
  const version = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;

  const constant = fs.readFileSync('./build/constant.ts').toString() + '\n';
  const str = constant.replace(/\d+\-\d+/g, version);

  fs.writeFileSync('./build/constant.ts', str);

  let versionStr = ''; //版本信息字符串

  // 如果versionPath存在，将先读取里边的版本信息
  if (fs.existsSync(versionPath)) {
    versionStr = fs.readFileSync(versionPath).toString() + '\n';
  }

  // 根据版本信息是已存在commit，进行不同处理
  if (versionStr.indexOf(commit) != -1) {
    console.warn('\x1B[33m%s\x1b[0m', 'warming: 当前的git版本数据已经存在了!\n');
  } else {
    const name = execSync('git show -s --format=%cn').toString().trim(); //姓名
    const email = execSync('git show -s --format=%ce').toString().trim(); //邮箱
    const date = new Date(execSync('git show -s --format=%cd').toString()); //日期
    const message = execSync('git show -s --format=%s').toString().trim(); //说明

    versionStr = `git:${commit}\n作者:${name}<${email}>\n日期:${
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1) +
      '-' +
      date.getDate() +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes()
    }\n说明:${message}\n版本号:${version}\n${new Array(80).join('*')}\n${versionStr}`;
    fs.writeFileSync(versionPath, versionStr);
  }
}

getVersion();
