const app = getApp();
import config from '../../config'
import { debounce } from '../../utils/fnOptimiz'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _page: 1,
    list: [],
    loadDone: false,
    loadText: '正在加载',
    active: 0,
    tabs: [
      {
        label: '未读',
        value: 0
      }, {
        label: '已读',
        value: 1
      }, {
        label: '全部',
        value: 2
      }
    ],
    showDetail: false, // 是否显示详情
    queryResultTips: '',
    detailImage: '',
    detailArr: [], // 当前详情color数组
    preorderInfo: {}, // 储存请求过的详情
    triggered: false,
  },

  onLoad: function () {
    this._getList()
  },
  _onRefresh () {
    // console.log('_onRefresh')
    this.data._page = 1
    this._getList()
  },
  // TODO 上拉加载
  _loadMore: debounce(function (e) {
    // console.log('_loadMore')
    if (this.data.noMore || this.data.active === 1) return
      this.data._page = this.data._page + 1
      this._getList()
  }, 1000, true),
  /**
   * TODO 顶部tab切换
   * @param {e} e 
   */
  tabChange(e) {
    // const query = wx.createSelectorQuery(),
    //   index = this.data.active  // 获取切换前的tab下标
    // query.selectViewport().scrollOffset(res => {
    //   // console.log(res)
    //   const key = `tabs[${index}].scrollTop`
    //   this.setData({ [key]: res.scrollTop })  // 保存切换前页面滚动高度
    // }).exec()
    // wx.pageScrollTo({ // 跳转到之前保留的滚动位置
    //   scrollTop: this.data.tabs[active].scrollTop,
    //   duration: 0
    // })
    let active = e.detail.index
    this.setData({ active });
  },
  itemClick (e) {
    // console.log(e.detail)
    const { styleName, image, id } = e.detail
    this.setData({
      showDetail: true,
      detailImage: image
    })
    if(this.data.preorderInfo[styleName]) {
      this.setData({
        detailArr: this.data.preorderInfo[styleName]
      })
      return // 如果请求多就不再发送请求
    }
    this.readNotice(id, styleName)
  },
  itemClose () {
    this.setData({
      showDetail: false
    })
  },
  /**
   * TODO 获取
   */
  _getList () {
    const params = {
      url: config.getArrivalNoticeList,
      params: {
        page: this.data._page,
        size: 60
      }
    }
    app.nGet(params).then(({data}) => {
      if (data && data.list) {
        const {page, pages, list: resList} = data
        let list = resList
        if (this.data._page > 1) {
          list = [...this.data.list, ...list]
        }
        this.setData({
          list,
          loadDone: page >= pages || !resList.length,
          loadText: page >= pages || !resList.length ? '暂无数据' : '正在加载'
        })
      } else {
        this.setData({
          loadDone: true,
          loadText: '获取失败'
        })
      }
    }).catch(err => {
      // console.log(err)
      this.setData({
        loadDone: true,
        loadText: '获取失败'
      })
    }).finally (() => {
      this.setData({ triggered: false })
    })
  },
  /**
   * 读取到货通知
   */
  readNotice (id, styleName) {
    if (this.data.queryResultTips) { // 清空上次请求结果提示消息
      this.setData({queryResultTips: ''})
    }
    let params = {
      url: config.getArrivalNotice,
      params: {
        userId: id,
        stylename: styleName
      }
    }
    app.nGet(params).then(({ data }) => {
      // console.log(data)
      const index = this.data.list.findIndex(item => item.styleName === styleName && item.id === id)
      if (index !== -1) {
        const key = `list[${index}].isRead`
        // 设置为已读
        this.setData({
          [key]: 1
        })
      }
      const key = `preorderInfo.${styleName}`
      this.setData({
        [key]: data,
        detailArr: data
      })
      if (!data.length) {
        this.setData({
          queryResultTips: '暂无数据'
        })
      }
    }).catch(err => {
      // console.log(err)
      this.setData({
        queryResultTips: '加载失败！'
      })
    })
  }
})
