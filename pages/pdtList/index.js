// pages/pdtList/index.js
const app = getApp();
import config from '../../config.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    _type: '',
    _search: '',
    _attrIdList: [],
    _categoryId: '',
    _page: 1,
    _size: 20,
    list: [],
    loadMore: { // 加载信息
      title: '正在加载',
      loadDone: false
    },
    _searchTypeId: '',
    _searchType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      _type: options.type || '',
      _search: options.search || '',
      _attrIdList: options.attrIdList && options.attrIdList.split(',') || [],
      _categoryId: options?.categoryId ?? '',
      _searchTypeId: options?.searchTypeId ?? '',
      _searchType: options?.searchType ?? ''
    })
    let title = ''
    switch (this.data._type) {
      case '1':
        title = '当季新品'
        break
      case '2':
        title = '过季商品'
        break
      case '3':
        title = '预订商品'
          break
    }
    title && wx.setNavigationBarTitle({title})
    this.getList()
  },

  getList () {
    let url = '',
      params = {
        page: this.data._page,
        size: this.data._size,
        categoryId: this.data._categoryId
      }
    switch (this.data._type) {
      case '1':
        url = config.timeGoods
        params = {
          type: 'in_season',
          ...params
        }
        break
      case '2':
        url = config.timeGoods
        params = {
          type: 'out_dated',
          ...params
        }
        break
      case '3':
        url = config.indexNewPdtQuery
        params = {
          search: this.data._search,
          attrIdList: JSON.stringify(this.data._attrIdList),
          isReserve: true,
          searchTypeId: this.data._searchTypeId,
          searchType: this.data._searchType,
          ...params
        }
        break
      default:
        url = config.indexNewPdtQuery
        params = {
          search: this.data._search,
          attrIdList: JSON.stringify(this.data._attrIdList),
          searchTypeId: this.data._searchTypeId,
          searchType: this.data._searchType,
          ...params
        }
    }

    app.nGet({url, params}).then(({data}) => {
      if (data && data.list) {
        const { list, page, pages } = data
        if (this.data._page === 1) {
          this.setData({
            list,
            'loadMore.title': Number(page) >= Number(pages) || !list.length ? '暂无数据' : '正在加载',
            'loadMore.loadDone': Number(page) >= Number(pages) || !list.length
          })
        } else {
          let loadlist = [...this.data.list, ...list]
          this.setData({
            total,
            list: loadlist,
            'loadMore.title': Number(page) >= Number(pages) || !list.length ? '暂无数据' : '正在加载',
            'loadMore.loadDone': Number(page) >= Number(pages) || !list.length
          })
        }
      } else {
        this.setData({
          'loadMore.title': '暂无数据',
          'loadMore.loadDone': true
        })
      }
    }).catch(err => {
      this.setData({
        'loadMore.title': '获取失败',
        'loadMore.loadDone': true
      })
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.loadMore.loadDone) return
    this.data._page = this.data._page + 1
    this.getList()
  }
})