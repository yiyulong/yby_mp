// pages/orderList/index.js
const app = getApp();
import config from '../../config.js';
import Dialog from '@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderConfig: {},
    ordersData: [],
    orderID: '', // 补退货单 订单号
    showType: {
      from: 'rOrderInfo',
      orderType: ''
    }, // 下单组件所需要参数
    deleteLoading: false,
    submitLoading: false,
    orderNumber: '',
    orderStatus: '',
    orderStatusCh: '',
    orderStatusEn: '',
    totalAmount: null,
    totalQty: null,
    activeNames: ['0'],
    address: {},
    expressWay: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var orderType = options.orderType || '';
    var orderID = options.orderID || '';

    switch (orderType.toLocaleLowerCase()) {
      case 'backorder':
        wx.setNavigationBarTitle({ title: '补货订单' })
        break
      case 'returnorder':
        wx.setNavigationBarTitle({ title: '退货订单' })
        break
      case 'normal':
        wx.setNavigationBarTitle({ title: '原始订单' })
        break
    }
    this.setData({
      orderID,
      'showType.orderType': orderType
    })

    this.preparePageData(); // 加载页面数据
  },

  /** 加载数据 */
  preparePageData() {
    var paramData = {
      url: config.rOrderGet,
      params: {
        orderId: this.data.orderID,
        orderType: this.data.showType.orderType
      }
    };
    app.nGet(paramData).then(ret => {
      if (ret.data) {
        // for (var i = 0; i < ret.data.list.length; i++) {
        //   ret.data.list[i].isCheck = false;
        // }
        let orderConfig = {
          orderNumber: ret.data.orderNumber,
          orderStatusCh: ret.data.orderStatusCh,
          totalAmount: ret.data.totalAmount,
          totalQty: ret.data.totalQty,
          address: ret.data.address,
          orderStatusEn: ret.data.orderStatusEn
        };
        const { address, expressWay, orderNumber, orderStatus, orderStatusCh, orderStatusEn, totalAmount, totalQty } = ret.data
        this.setData({
          orderConfig: orderConfig,
          ordersData: ret.data.list,
          address, expressWay, orderNumber, orderStatus, orderStatusCh, orderStatusEn, totalAmount, totalQty
        });
        // console.log(JSON.stringify(ret.data.list));
      }
    }, res => {
      // console.error(JSON.stringify(res));
    });
  },
  /**
   * todo 删除单个商品
   * @param {*} e 
   */
  deletePdt: function (e) {
    // console.log(e)
    const selectStyleName = e.detail.styleName // 当前选中的商品 styleName
    wx.showLoading({
      title: '正在删除...',
      mask: true,
    });
    console.log(this.data.orderID, selectStyleName)
    var paramData = {
      url: config.deleteOrderProduct,
      params: {
        orderId: this.data.orderID,
        styleName: selectStyleName,
      }
    }
    app.nPost(paramData).then(ret => {
      wx.hideLoading();
      /* 删除对应商品 */
      let currentList = this.data.ordersData
      const someIndex = currentList.findIndex(item => item.styleName === selectStyleName) // 找到选中的下标
      if (someIndex !== -1) {
        currentList.splice(someIndex, 1)  // 删除
        this.setData({
          ordersData: currentList
        })
      }
    }, err => {
      // wx.hideLoading();
    });
  },
  /**
   * todo 删除整个订单
   */
  deleteOrder () {
    Dialog.confirm({
      title: '删除订单',
      message: '删除后不可撤销！确定要删除吗？',
    }).then(() => {
      this.setData({
        deleteLoading: true
      })
      var paramData = {
        url: config.deleteOrder,
        params: {
          orderId: this.data.orderID
        }
      }
      app.nPost(paramData).then(res => {
        this.setData({
          deleteLoading: false
        })
        app.showMsgSuccess('已删除订单')
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
        console.log(res)
      }).catch(err => {
        console.log(err)
        this.setData({
          deleteLoading: false
        })
      })
    }).catch(() => {
    })
  },
  submitOrder () {
    const allData = this.selectAllComponents('.prod-list-cell-component')
    // console.log(allData)
    const matrixData = allData.reduce((acc, currentItem) => {
      for (let key in currentItem) {
        // { pAliasId, qty, productId }
        acc.push({ pAliasId: key * 1, ...currentItem[key] })
      }
      return acc
    }, [])
    // console.log(matrixData)
    var data = {
      url: config.submitOrder,
      params: {
        orderId: this.data.orderID,
        qtyList: JSON.stringify(matrixData)
      }
    }
    app.nPost(data).then(res => {
      // console.log(res)
      if (res.code === 0 || res.code === 666) {
        app.showMsgSuccess('提交成功')
        this.preparePageData()
      } else {
        app.showMsg('提交失败')
      }
    }).catch(err => {
      // console.log(err)
      app.showMsg(err.message || '提交失败')
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail
    })
  }
})