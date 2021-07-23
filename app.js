const openIdUrl = require('./config').openIdUrl
import { updateManager } from './utils/updateManager'
import { getToken } from './utils/userTokenCache'

App({

  onLaunch: function(opts) {
    // this.getValue('role') === 'AU' ? tabs.splice(2, 1) : tabs.splice(3, 1)

    // // 云开发初始化
    // wx.cloud.init({
    //   env:"dev-ylb6u",
    //   traceUser:true
    // })
  },

  onShow: function(opts) {
    updateManager()
  },

  onHide: function() {
    console.log('App Hide')
  },

  globalData: {
    car_defaultOrderTypeIndex: null,  // 购物车页面默认orderType tab下标
    car_defaultSeasonIndex: null,  // 购物车页面默认season tab下标
    SDKVersion: wx.getSystemInfoSync().SDKVersion
  },

  // lazy loading openid
  getUserOpenId: function(isNeedWxLogin) {
    const _this = this
    return new Promise((resolve, reject) => {
      if (!isNeedWxLogin) {
        resolve()
      } else {
        wx.login({
          success: function(data) {
            _this.nGet({
              url: openIdUrl,
              params: {
                jsCode: data.code
              }
            }).then(res => {
              console.log('拉取hasOpenId成功', res)
              resolve()
            }).catch(err => {
              console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
              reject()
            })
          },
          fail: function(err) {
            console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
            reject()
          }
        })
      }
    })
  },

  // ======网络请求======
  fetch: async function (data, type = 'GET') {
    const _that = this;
    let sessionKey = this.getValue('sessionKey')
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
        sessionKey = userCache.sessionToken
      } catch (err) {
        console.log(err)
      }
    }
    let cityId = this.getValue('cityCode') || '310000';
    let promise = new Promise(function(resolve, reject) {
      wx.request({
        url: data.url,
        data: data.params,
        method: type,
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          'session-Token': sessionKey || '',
          'city': cityId,
        },
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {
          // console.log(res)
          if (res.errMsg !== 'request:ok') {
            _that.showMsg(res.errMsg)
          }
          if (res.data && res.data.code === 666 || res.data.code === 0) {
            resolve(res.data);
          } else if (res.data && res.data.code === 8006 || res.data && res.data.code === 8005) {  // 8006 用户未登录  8005 无效的SESSION-TOKEN
            _that.clearValue();
            const pages = getCurrentPages(),
              currentPage = pages[pages.length - 1]
            if (currentPage && currentPage.route.split(/\//, 2).pop() === 'login') return
            wx.navigateTo({
              url: '/pages/login/index'
            });
          } else {
            reject(res.data);
            if (res.data && res.data.message) {
              _that.showMsg(res.data.message);
            }
          }
        }
      });
    });
    return promise;
  },
  nGet: function (data) {
    return this.fetch(data)
  },
  nPost: function (data) {
    return this.fetch(data, 'POST')
  },
  nPut: function (data) {
    return this.fetch(data, 'PUT')
  },
  // ======本地存储======

  saveValue: function(key, value) {
    wx.setStorageSync(key, value);
  },

  getValue: function(key) {
    return wx.getStorageSync(key);
  },

  clearValue: function() {
    wx.clearStorageSync();
  },

  // ======提示框======
  showMsg: function(msg, rduration) {
    if (!rduration) {
      rduration = 2;
    }
    rduration = 1000 * rduration;
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: rduration
    })
  },

  // ============
  showMsgSuccess: function (msg, rduration) {
    if (!rduration) {
      rduration = 2;
    }
    rduration = 1000 * rduration;
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: rduration
    })
  },
  /**
   * 判断用户是否登录
  */
  isLogin: function () {
    var sessionKey = this.getValue('sessionKey');
    return sessionKey ? true : false;
  },
})