// pages/contactsChoose/index.js
const app = getApp();
import config from '../../config.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    contactsData: [],
    type: null,  // 0-收货地址 1-残次地址 2-正常退货
    fullAddress: '',
    addressId: '',
    show: false,
    expressWay: [],
    expressWayDesc: '',
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({type: options.type})
    const _this = this
    wx.getStorage({
      key: 'expressWay',
      success (res) {
        _this.setData({ expressWay: res.data })
      }
    })
    wx.getStorage({
      key: 'expressWayDesc',
      success (res) {
        _this.setData({ expressWayDesc: res.data })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.preparePageData();
  },

  // 选择联系人
  chooseContact: function(e) {
    // console.log(JSON.stringify(e.currentTarget.dataset.contact));
    this.setData({
      fullAddress: e.currentTarget.dataset.contact.fullAddress,
      addressId: e.currentTarget.dataset.contact.addressId,
      show: true
    })
  },

  /** 新增联系人 */
  addAddressAction: function(e) {
    wx.navigateTo({
      url: `/pages/contactsUpdate/index?type=${this.data.type}`,
    });
  },

  //===============================

  /** 加载数据 */
  preparePageData() {
    var data = {
      url: config.addressList,
      params: {
        type: this.data.type
      }
    };
    app.nGet(data).then(ret => {
      if (ret.data) {
        this.setData({
          contactsData: ret.data.reverse()
        });
      }
    }, res => {
      // console.error(JSON.stringify(res));
    });
  },
  close () {
    this.setData({ show: false })
  },
  select () {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      address: this.data.fullAddress,
      addressID: this.data.addressId,
      expressWay: this.data.expressWay[this.data.index]
    })
    wx.navigateBack()
  },
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  }
})