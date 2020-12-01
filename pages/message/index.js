const app = getApp()
import { getMsgInfo } from '../../ajax/user'
Page({
  data: {
    loading: false,
    result: [],
    loadDone: false,
    title: '正在加载...',
    page: 1,
    size: 20,
    userType: null
  },
  onLoad () {
    console.log('load')
  },
  onShow () {
    console.log('show')
    wx.getStorage({
      key: 'role',
      success: (res) => {
        this.setData({ userType: res.data })
      }
    })
    this._getMessage()
  },
  onReady () {
    console.log('ready')
  },
  _getMessage () {
    this.setData({ loading: true })
    getMsgInfo({
      page: this.data.page,
      size: this.data.size
    }).then(res => {
      // console.log(res)
      this.setData({
        result: this.data.page === 1 ? res.list : this.data.result.concat(res.list),
        loadDone: res?.list?.length !== this.data.size,
        title: res?.list?.length !== this.data.size ? '暂无更多' : '正在加载...'
      })
    }).finally(() => {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    })
  },
  onPullDownRefresh() {
    if (this.data.loading) return
    this.setData({ page: 1 })
    this._getMessage()
  },
  onReachBottom() {
    if (this.data.loadDone) return
    this.setData({ page: this.data.page + 1 })
    this._getMessage()
  }
})