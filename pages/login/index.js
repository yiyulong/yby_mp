//login index.js
//获取应用实例
const app = getApp()
import { login } from '../../ajax/user'

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
  onUnload () {
    app.globalData.at_login_page = false
  },
  // 点击登陆按钮
  async _login ({ detail: { value } }) {
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

      wx.switchTab({
        url: '/pages/index/index'
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
  }
})
