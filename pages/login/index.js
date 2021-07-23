//login index.js
//获取应用实例
const app = getApp()
import { login } from '../../ajax/user'
import { saveToken } from '../../utils/userTokenCache'

Page({
  data: {
    userName: '',
    password: '',
    focus: false,
    logging: false,
    version: '' // 当前小程序线上版本号
  },
  onLoad () {
    const accountInfo = wx.getAccountInfoSync()
    this.setData({
      version: accountInfo.miniProgram.version
    })
  },
  // 点击登陆按钮
  async _login ({ detail: { value } }) {
    const _this = this
    this.setData({ logging: true })
    const { userName, password } = value ?? this.data
    await this._verifyInput(userName, password)
    login({
      username: userName,
      password: password
    }).then(res => {
      wx.setStorageSync('username', res.username);
      wx.setStorageSync('uid', res.uid);
      wx.setStorageSync('sessionKey', res.sessionToken);
      wx.setStorageSync('productMode', res.productMode);
      wx.setStorageSync('orderListHeader', res.orderListHeader) // 订单头部tab
      wx.setStorageSync('role', res.role) // 判断用户身份
      // wx.setStorageSync('isNeedWxLogin', res.isNeedWxLogin) // 后台是否已经获取到openid
      wx.setStorageSync('expressWay', res.expressWay) // 快递方式
      wx.setStorageSync('expressWayDesc', res.expressWayDesc)
      saveToken(JSON.stringify(res))
      app.getUserOpenId(true).then(() => {
        const tmplIds = ['PPkMjx3zcS7CAUrW9YCkLtlLb0h7ON3--LJSa8Sqcyw', 'bwnMpNCY0OOMCOh_R9cHerG1rMS8U9tb9lpYtnipob4']
        wx.getSetting({
          withSubscriptions: true,
          success (res) {
            console.log(res.subscriptionsSetting)
            const { itemSettings } = res.subscriptionsSetting
            let restId = []
            let allAccept = false
            if (itemSettings) {
              for (let index = 0; index < tmplIds.length; index++) {
                const element = tmplIds[index]
                if (typeof itemSettings[element] === 'undefined') {
                  restId.push(element)
                }
              }
              allAccept = tmplIds.every(item => {
                return (typeof itemSettings[item] !== 'undefined') && (itemSettings[item] === 'accept')
              })
            } else {
              restId = tmplIds
            }
            console.log('restId: ' + restId, 'allAccept: ' + allAccept)
            if (!allAccept) {
              wx.showModal({
                content: '是否订阅消息通知',
                success (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.requestSubscribeMessage({
                      tmplIds,
                      success (res) {
                        console.log(res)
                        const isAccept = restId.some(item => {
                          return res[item] === 'accept'
                        })
                        wx.showToast({
                          title: isAccept ? '订阅成功！' : '您已拒绝授权，将无法在微信中收到回复通知！',
                          duration: 1500,
                          icon: isAccept ? 'success' : 'none'
                        })
                        setTimeout(() => {
                          _this._jump()
                        }, 1500)
                      },
                      fail (err) {
                        console.log(err)
                      }
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                    wx.showToast({
                      title: '您已拒绝授权，将无法在微信中收到回复通知！',
                      duration: 1500,
                      icon: 'none'
                    })
                    setTimeout(() => {
                      _this._jump()
                    }, 1500)
                  }
                }
              })
            } else {
              _this._jump()
            }
          },
          fail () {
            _this._jump()
          }
        })
      }).catch(err => {
        _this._jump()
      })
    }).catch(err => {
      this.setData({ logging: false })
    })
  },
  // 密码输入框自动聚焦
  _nextInputActive () {
    this.setData({ focus: true })
  },
  // 判断输入的用户名或密码是否为空
  _verifyInput (...val) {
    return new Promise((resolve, reject) => {
      if (val.some(item => item === '')) {
        wx.showToast({
          title: '请输入用户名或密码',
          icon: 'none'
        })
        // 关闭登陆按钮状态效果
        this.setData({ logging: false })
        reject()
      }
      resolve()
    })
  },
  _jump () {
    // console.log(getCurrentPages())
    const pages = getCurrentPages(),
      prePage = pages[pages.length - 2]
    if (pages.length >= 2 && prePage.route.split(/\//).indexOf('login') < 0) {
      prePage.onLoad(prePage.options)
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
})
