import { getToken } from '../utils/userTokenCache'

// const baseUrl = 'http://120.24.29.201:8080/trendfinder'
const baseUrl = 'https://yesbyyesir.dlt-world.com'
// const baseUrl = 'https://cmst.dlt-world.com/yby'
async function getCommonHeader () {
  let header = {
    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
  // 如果sessionKey有值则带上
  let sessionKey = wx.getStorageSync("sessionKey")
  if (!sessionKey) {
    try {
      const userCacheStr = await getToken()
      const userCache = JSON.parse(userCacheStr)
      wx.setStorageSync('username', userCache.username);
      wx.setStorageSync('uid', userCache.uid);
      wx.setStorageSync('sessionKey', userCache.sessionToken);
      wx.setStorageSync('productMode', userCache.productMode);
      wx.setStorageSync('orderListHeader', userCache.orderListHeader) // 订单头部tab
      wx.setStorageSync('role', userCache.role) // 判断用户身份
      // wx.setStorageSync('isNeedWxLogin', userCache.isNeedWxLogin) // 后台是否已经获取到openid
      wx.setStorageSync('expressWay', userCache.expressWay) // 快递方式
      wx.setStorageSync('expressWayDesc', userCache.expressWayDesc)
    } catch (err) {
      console.log(err)
    }
   }
   header = Object.assign({}, header, {
    'session-Token': sessionKey || ''
  })
  return header
}

Object.defineProperty(Promise.prototype, 'finally', {
  get: () => function (callback) {
    const P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    )
  }
})

function request (url, data = {}, method = "POST", config = {}) {

  let showToast = true,
    showLoading = false,
    loadingTitle = '加载中...'
  // 默认显示toast
  if (config['showToast'] !== undefined && config['showToast'] === false) {
    showToast = false
  }
  // 默认显示loading
  if (config['showLoading'] != undefined && config['showLoading'] == true) {
    showLoading = true
  }
  if (config['loadingTitle']) {
    loadingTitle = config['loadingTitle']
  }

  return new Promise(async (resolve, reject) => {
    // 是否显示loading
    if (showLoading) {
      wx.showLoading({ title: loadingTitle, icon: 'none', mask: true })
    }
    const header = await getCommonHeader().catch(err => {
      console.log(err)
    })
    wx.request({
      url,
      data,
      header,
      method,
      success: ({ cookies, data, errMsg, header, statusCode }) => {

        // 服务器 非200 错误
        if (statusCode && statusCode !== 200) {
          wx.showToast({ title: '服务器 ' + statusCode + ' 错误', icon: 'none' })
          reject(data)
          return
        }
        if (data?.code === 666 || data?.code === 0) {
          resolve(data.data)
        } else if (data?.code === 8006 || data?.code === 8005) { // 8006 用户未登录  8005 无效的SESSION-TOKEN
          wx.clearStorageSync()
          const pages = getCurrentPages(),
            currentPage = pages[pages.length - 1]
          if (currentPage && currentPage.route.split(/\//, 2).pop() === 'login') return
          wx.navigateTo({
            url: '/pages/login/index'
          })
        } else {
          if (showToast) {
            wx.showToast({ title: data?.message || '请求错误', icon: 'none' })
          }
          reject(data)
        }
      },
      fail: err => {

        if (err.errMsg.indexOf('url not in domain list') > -1) {
          wx.showToast({ title: '请求url不在合法域名中，请打开调试模式', icon: 'none' })
        }

        reject(err)
      },
      complete: () => {
        if (showLoading) {
          wx.hideLoading()
        }
      }
    })
  })

}

function getRequest (url, data = {}, config = {}) {
  return request(baseUrl + url, data, "GET", config)
}
function postRequest (url, data = {}, config = {}) {
  return request(baseUrl + url, data, "POST", config)
}

module.exports = {
  getRequest: getRequest,
  postRequest: postRequest
}