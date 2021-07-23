const fs = wx.getFileSystemManager()
const filePath = `${wx.env.USER_DATA_PATH}/userTokenCache.txt`
// 判断文件/目录是否存在
const _access = () => new Promise ((resolve, reject) => {
  fs.access({
    path: filePath,
    success (res) {
      // 文件存在
      resolve(res)
    },
    fail (err) {
      // 文件不存在或其他错误
      reject(err)
    }
  })
})
// 写文件
const _writeFile = (data) => new Promise ((resolve, reject) => {
  fs.writeFile({
    filePath,
    data,
    success (res) {
      resolve(res)
    },
    fail (err) {
      reject(err)
    }
  })
})
// 读取本地文件内容
const _readFile = (data) => new Promise ((resolve, reject) => {
  fs.readFile({
    filePath,
    encoding: 'utf8',
    success (res) {
      resolve(res.data)
    },
    fail (err) {
      reject(err)
    }
  })
})
// 删除文件
const _unlink = (data) => new Promise ((resolve, reject) => {
  fs.unlink({
    filePath,
    success (res) {
      resolve(res)
    },
    fail (err) {
      reject(err)
    }
  })
})
const saveToken = async (token) => {
  try {
    await removeToken()
  } catch (error) {
    console.log(error)
  } finally {
    _writeFile(token)
  }
}
const removeToken = () => new Promise (async (resolve, reject) => {
  try {
    await _access()
    await _unlink()
    resolve()
  } catch (error) {
    reject(error)
  }
})
const getToken = () => new Promise (async (resolve, reject) => {
  try {
    await _access()
    const token = await _readFile()
    resolve(token)
  } catch (error) {
    reject(error)
  }
})
module.exports = {
  getToken: getToken,
  saveToken: saveToken,
  removeToken: removeToken
}