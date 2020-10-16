const app = getApp();
import config from '../../config.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchCondition: '',
    ordersData: [],
    _page: 1,
    loadDone: false,
    season: null,
    orderType: '',
    // seasonTabs: [],
    // defaultSeasonIndex: 0 // tab默认选中下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // const tabList = app.getValue('orderListHeader')
    // this.setData({ seasonTabs: tabList })
    const { orderType, season } = options
    this.setData({ orderType, season, defaultSeasonIndex: season })
    switch (orderType) {
      case 'backOrder':
        wx.setNavigationBarTitle({ title: '补货订单' })
        break
      case 'returnOrder':
        wx.setNavigationBarTitle({ title: '退货订单' })
        break
      case 'normal':
        wx.setNavigationBarTitle({ title: '原始订单' })
        break
    }
    this.prepareData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data._page = 1
    this.prepareData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.loadDone) return
    this.data._page = this.data._page + 1
    this.prepareData()
  },

  // 点击订单，进入订单详情页
  orderClickAction: function(e) {
    wx.navigateTo({
      // url: '/pages/orderDetailList/index?orderType=' + '03' + '&orderID=' + e.currentTarget.dataset.data.orderId,
      url: `/pages/orderDetailList/index?orderType=${this.data.orderType}&orderID=${e.currentTarget.dataset.data.orderId}`,
    });
  },

/*   seasonTabsChange(e) {
    const season = e.detail.value
    this.setData({season})
    this.data._page = 1
    this.prepareData()
    wx.pageScrollTo({ // 页面滚动到顶部
      scrollTop: 0
    })
  }, */
  // ----------------------------

  /** 加载数据 */
  prepareData() {
    const data = {
      url: config.rOrderQuery,
      params: {
        page: this.data._page,
        size: 20,
        orderType: this.data.orderType,
        season: this.data.season,
        searchCondition: this.data.searchCondition
      }
    };
    app.nGet(data).then(res => {
      if (res.data) {
        this.data._page === 1 ? this.data.ordersData = res.data.list : this.data.ordersData.push(...res.data.list)
        this.setData({
          loadDone: res.data.page >= res.data.pages,
          ordersData: this.data.ordersData
        });
      }
    }, res => {
      // console.error(JSON.stringify(res));
    });
  },
  onSearch (e) {
    this.data.searchCondition = e.detail
    this.data._page = 1
    this.prepareData()
  },
  onClear () {
    this.data.searchCondition = ''
    this.data._page = 1
    this.prepareData()
  }

})