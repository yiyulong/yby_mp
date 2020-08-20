//category.js
import { getB2bCategoryInfo } from '../../ajax/product'
//获取应用实例
const app = getApp()

Page({
  data: {
    activeKey: 0,
    _resType: '',
    tabs: [],
    result: [],
    _heightRecords: [], // 记录滚动所需的高度
    currentView: 0, // 当前tabBar所需要滚到到的视图下标
    contentScrollTop: 0 // 右侧scroll-view的scrollTop
  },
  onLoad () {
    getB2bCategoryInfo().then(res => {
      const { type, resultList } = res
      this.data._resType = type
      let tabs = [], result = []
      resultList.forEach(element => {
        const { categoryName, id, orderNo, subCategoryInfoList } = element
        tabs.push({ categoryName, id, orderNo })
        result.push(subCategoryInfoList)
      })
      this.setData({ tabs, result }, () => {
        this._calcHeight()
      })
    })
  },
  _calcHeight () {
    const query = wx.createSelectorQuery()
    query.selectAll('.tab-content-scrollview .main-content-item').fields({ size: true }, (rects => {
      let temp = 0;
      for (let i = 0; i < rects.length; i++) {
        this.data._heightRecords[i] = temp + (rects[i].height || 0);
        temp = this.data._heightRecords[i];
      }
    })).exec()
  },
  _scrollTabBar (index) {
    const len = this.data.tabs.length
    if (len === 0) return
    let currentView = index < 5 ? 0 : index - 4
    if (currentView >= len) currentView = len - 1
    this.setData({ currentView: currentView })
  },

  _onChange (e) {
    const _heightRecords = this.data._heightRecords
    const index = e.currentTarget.dataset.index
    const contentScrollTop = _heightRecords[index - 1] || 0
    this.setData({
      activeKey: index,
      contentScrollTop: contentScrollTop
    })
    this._scrollTabBar(index)
  },
  _contentScroll(e) {
    const _heightRecords = this.data._heightRecords
    if (_heightRecords.length === 0) return
    const length = this.data.tabs.length
    const scrollTop = e.detail.scrollTop
    let index = 0;
    if (scrollTop >= _heightRecords[0]) {
      for (let i = 1; i < length; i++) {
        if (scrollTop >= _heightRecords[i - 1] && scrollTop < _heightRecords[i]) {
          index = i
          break
        }
      }
    }
    if (index !== this.data.activeKey) {
      this.setData({ activeKey: index })
      this._scrollTabBar(index)
    }
  },
  _jumpPdt ({ currentTarget: { dataset: { id } } }) {
    wx.navigateTo({
      url: `/pages/pdtList/index?searchTypeId=${id}&searchType=${this.data._resType}`,
    })
  }
})
