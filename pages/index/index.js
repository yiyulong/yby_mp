//index.js
//获取应用实例
const app = getApp();
import config from '../../config.js';
import {
  getProductCarousel, // 获取幻灯片列表
  getB2bOrderBatchInfo, // 获取时装系列
  getB2bChoicenessAttributeInfo, // 获取精选分类
  getB2bChoicenessProductInfo, // 获取精选商品信息
  getB2bPdfProfileInfo // 获取PDF信息
} from '../../ajax/product'

Page({
  data: {
    carouselList: [], // 幻灯片列表
    orderBatchInfo: {}, // 时装系列
    choicenessAttributeInfo: {}, // 精选分类
    choicenessAttributeInfo_main: {}, // 精选分类主分类
    choicenessAttributeInfo_rest: [], // 精选分类剩余分类
    choicenessProductInfo: {}, // 精选商品信息
    pdfProfileInfo: [], // pdf信息

    categoryList: [], // 分类列表
    allInfo: { // 全部 商品列表信息
      page: 1,
      size: 30,
      pages: 0,
      total: 0,
      list: []
    },
    allLoadMore: { //全部 加载信息
      title: "",
      loadDone: false
    },
    attrsList: [], // 筛选 属性list
    tabList: [
      { label: '首页', value: 0, scrollTop: 0 },
      { label: '全部', value: 1, scrollTop: 0 },
      { label: '筛选', value: 2, scrollTop: 0 }
    ],
    tabIndex: 0,
    swiperIndex: 0
  },

  onHide: function() {
    wx.removeStorage({
      key: 'selectedFilterItem'
    })
  },

  onLoad () {
    // 轮播图
    getProductCarousel().then(res => {
      this.setData({
        carouselList: res.list,
      })
    })
    // 时装系列
    getB2bOrderBatchInfo().then(res => {
      this.setData({
        orderBatchInfo: res
      })
    })
    // 精选分类
    getB2bChoicenessAttributeInfo().then(res => {
      const { resultList, subTitle, title, type } = res
      this.setData({
        choicenessAttributeInfo: { subTitle, title, type },
        choicenessAttributeInfo_main: resultList.shift(),
        choicenessAttributeInfo_rest: resultList
      })
    })
    // 获取精选商品信息
    getB2bChoicenessProductInfo().then(res => {
      this.setData({
        choicenessProductInfo: res
      })
    })
    // 获取pdf信息
    getB2bPdfProfileInfo().then(res => {
      this.setData({
        pdfProfileInfo: res.resultList
      })
    })

    this.getCategory()
  },
  _tabChange ({ currentTarget: { dataset: { index: tabIndex } } }) {
    if (this.data.tabIndex === tabIndex) return
    this.setData({ swiperIndex: tabIndex })
  },
  _swiperChange ({ detail: { current: swiperIndex } }) {
    this.setData({ tabIndex: swiperIndex })
    if (swiperIndex === 1 && !this.data.allInfo.list.length) {
      this.getCategory()
      this.getPdtList({})
    } else if (swiperIndex === 2 && !this.data.attrsList.length) {
      this.getFilterList()
    }
  },
  _jumpUrl(e) {
    // console.log(e)
    let item = e.currentTarget.dataset.item
    if (item?.target && item?.type === 'href') {
      wx.navigateTo({
        url: `/pages/webview/index?url=${item.target}`
      })
    } else if (item?.target && item?.type === 'pdt') {
      wx.navigateTo({
        url: `/pages/pdtInfo/index?productId=${item.target}`

      })
    } else if (item?.target && item?.type === 'filter') {
      let target = [item.target]
      wx.navigateTo({
        url: `/pages/pdtList/index?attrIdList=${target}`
      })
    }
  },
  _jumpPdt ({ currentTarget: { dataset: { id, type, isArrivalNotice }}}) {
    // console.log(id, type)
    const param = `searchTypeId=${id}&searchType=${type}`
    let params = isArrivalNotice ? `${param}&isArrivalNotice=${isArrivalNotice}` : param
    wx.navigateTo({
      url: `/pages/pdtList/index?${params}`,
    })
  },
  _jumpPdf ({ currentTarget: { dataset } }) {
    const { url, id, existSub } = dataset
    if (existSub) {
      wx.navigateTo({
        url: `/subPages/other/pdfList/index?id=${id}`
      })
      return
    }
    wx.navigateTo({
      url: '/subPages/other/webPage/index',
      success (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage_index', { url })
      }
    })
  },

  // 获取最新商品列表
  // loadmore 是否上拉加载请求
  getPdtList(params, loadmore) {
    var data = {
      url: config.indexNewPdtQuery,
      params: {
        ...params,
        page: this.data.allInfo.page,
        size: this.data.allInfo.size
      }
    }
    app.nGet(data).then(({ data }) => {
      if (data && data.list) {
        this.setData({
          'allLoadMore.loadDone': this.data.allInfo.size > data.list.length
        })
        if (this.data.allInfo.page === 1) {
          this.setData({
            allInfo: data
          })
        } else {
          const list = [...this.data.allInfo.list, ...data.list]
          this.setData({
            'allInfo.list': list
          })
        }
      } else {
        this.setData({
          'allLoadMore.loadDone': true,
          'allLoadMore.title': '没有更多数据啦'
        })
      }
    }).catch(err => {
      this.setData({
        'allLoadMore.loadDone': true,
        'allLoadMore.title': '加载失败'
      })
    })
  },
  // 获取商品分类列表
  getCategory() {
    var data = {
      url: config.indexCategoryQuery,
      params: {}
    }
    app.nGet(data).then(data => {
      // console.log(data)
      if (data.data) {
        this.setData({
          categoryList: data.data,
        });

      }
    }, res => {
      // console.error(res);
    });
  },
  // 获取筛选列表
  getFilterList() {
    var data = {
      url: config.indexFilterQuery,
      params: {}
    }
    app.nGet(data).then(data => {
      if (data.data) {
        this.setData({
          attrsList: data.data,
        });
      }
    }, res => {
      // console.error(res);
    });
  },
  _searchDone({ detail }) {
    if (!detail) return
    let search = detail
    if (search) {
      wx.navigateTo({
        url: `/pages/pdtList/index?search=${search}`,
      });
    }
  },
  jumpToSearch() {
    wx.navigateTo({
      url: '/pages/searchPage/index',
    })
  },

  // 页面上拉触底事件的处理函数
  _loadMore () {
    if (this.data.allLoadMore.loadDone) return
    this.setData({
      'allInfo.page': Number(this.data.allInfo.page) + 1
    })
    this.getPdtList({})
  }
})