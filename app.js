//app.js
import { updateManager } from './utils/updateManager'

App({
  onLaunch: function () {
    // 版本更新
    updateManager()
  },
  globalData: {
    userInfo: null
  }
})