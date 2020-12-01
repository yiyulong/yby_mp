const app = getApp()
import config from '../../config.js';
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    active: 1, // 当前选中的tab下标
    tabs: [
      {
        scrollTop: 0,
        pageNo: 1,
        loadDone: false,
        loadText: '加载中...',
        label: '全部',
        value: 0,
        searchVal: ''
      }, {
        scrollTop: 0,
        pageNo: 1,
        showCtrl: false,
        loadDone: false,
        loadText: '加载中...',
        label: '待审核',
        value: 1,
        checkedId: null, // 单选按钮选中的id
        searchVal: ''
      }, {
        scrollTop: 0,
        pageNo: 1,
        showCtrl: false,
        loadDone: false,
        loadText: '加载中...',
        label: '已审核',
        value: 1,
        checkedId: null,
        searchVal: ''
      }
    ],
    orderList_all: {
      summary: {
        "foName": "尤尼克斯2020年第一季度产品订货会",
        "totalPricelist": 13093284,
        "approvedDate": null,
        "totalQty": 64298,
        "surname": "黄",
        "status": false,
        "totalAmt": 6723163.0599999987,
        "name": "晨",
        "logo": "http:\/\/101.132.156.18:8080\/resource\/fOrder\/1\/logo.jpg"
      },
      resultList: [],
      fields: []
    },
    orderList_wait: {
      summary: {},
      resultList: [],
      fields: []
    },
    orderList_ed: {
      summary: {},
      resultList: [],
      fields: []
    },
    searchVal: ''
  },
  onLoad () {
  },
  onShow () {
    /* if (app.isLogin() || typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        tabList: app.getValue('tabList'),
        selected: 2
      })
    } */
    this.getList()
  },
  _search ({ detail }) {
    console.log(detail)
    let keyPageNum = `tabs[${this.data.active}].pageNo`
    let keySearchVal = `tabs[${this.data.active}].searchVal`
    this.setData({
      [keyPageNum]: 1,
      [keySearchVal]: detail
    })
    this.getList(detail)
  },
  /**
   * TODO 上拉加载
   */
  onReachBottom () {
    if (this.data.tabs[this.data.active].loadDone) return
    let keyPageNum = `tabs[${this.data.active}].pageNo`
    this.setData({
      [keyPageNum]: this.data.tabs[this.data.active].pageNo + 1
    })
    this.getList()
  },
  /**
   * @param dataType WAIT_APPROVE/IN_APPROVE/APPROVED，空值或不传值显示全部
   */
  getList (searchCondition = '') {
    let objKey = 'orderList_'
    switch (this.data.active) {
      case 1:
        objKey += 'wait'
        break
      case 2:
        objKey += 'ed'
        break
      default:
        objKey += 'all'
    }
    const types = ['', 'WAIT_APPROVE', 'APPROVED']
    const pageNo = this.data.tabs[this.data.active].pageNo
    const paramData = {
      url: config.getApprovalOrderList,
      params: {
        pageNo: pageNo,
        dataType: types[this.data.active],
        searchCondition
      }
    }
    app.nGet(paramData).then(({data}) => {
      let { resultList, pageSize } = data
      let loadDoneKey = `tabs[${this.data.active}].loadDone`
      let textKey = `tabs[${this.data.active}].loadText`
      if (pageNo === 1) {
        this.setData({
          [objKey]: data
        })
      } else {
        let orderListKey = `${objKey}.resultList`
        this.data[objKey].resultList.push(...resultList)
        this.setData({
          [orderListKey]: this.data[objKey].resultList
        })
      }
      this.setData({
        [loadDoneKey]: resultList.length < pageSize,
        [textKey]: resultList.length < pageSize ? '暂无更多数据' : '加载中...'
      })
    }).catch(err => {
      let loadDoneKey = `tabs[${this.data.active}].loadDone`
      let textKey = `tabs[${this.data.active}].loadText`
      this.setData({
        [loadDoneKey]: true,
        [textKey]: '加载失败'
      })
    })
  },
  tabChange(e) {
    const query = wx.createSelectorQuery(),
      index = this.data.active  // 获取切换前的tab下标
    query.selectViewport().scrollOffset(res => {
      // console.log(res)
      const key = `tabs[${index}].scrollTop`
      this.setData({ [key]: res.scrollTop })  // 保存切换前页面滚动高度
    }).exec()
    let active = e.detail.index
    let searchVal = this.data.tabs[active].searchVal
    this.setData({
      active,
      searchVal
    })
    wx.pageScrollTo({ // 跳转到之前保留的滚动位置
      scrollTop: this.data.tabs[active].scrollTop,
      duration: 0
    })
    if (active === 0 && this.data.orderList_all.resultList.length === 0) {
      this.getList()
    }
    if (active === 1 && this.data.orderList_wait.resultList.length === 0) {
      this.getList()
    } else if (active === 2 && this.data.orderList_ed.resultList.length === 0) {
      this.getList()
    }
  },
  radioChange (e) {
    if (e.detail) {
      const ctrlKey = `tabs[${this.data.active}].showCtrl`
      const checkKey = `tabs[${this.data.active}].checkedId`
      this.setData({
        [ctrlKey]: true,
        [checkKey]: e.detail
      })
    }
  },
  /**
   * TODO 驳回订单
   */
  rejectOrder (e) {
    const params = {
      url: config.rejectOrder,
      params: {
        // orderIds: JSON.stringify([parseInt(this.data.tabs[this.data.active].checkedId)]),
        orderId: parseInt(this.data.tabs[this.data.active].checkedId),
        rejectMsg: ''
      }
    }
    app.nPost(params).then(res => {
      // console.log(res)
      let list = this.data.orderList_wait.resultList
      let index = this.data.tabs[this.data.active].checkedId.split(',')[1]
      list.splice(index, 1)
      this.setData({
        'orderList_wait.resultList': list
      })
      Toast.success('操作成功')
    })
  },
  /**
   * TODO 提交订单
   */
  passOrder (e) {
    const params = {
      url: config.approveOrder,
      params: {
        // orderIds: JSON.stringify([parseInt(this.data.tabs[this.data.active].checkedId)])
        orderId: parseInt(this.data.tabs[this.data.active].checkedId)
      }
    }
    app.nPost(params).then(res => {
      // console.log(res)
      let list = this.data.orderList_wait.resultList
      let index = this.data.tabs[this.data.active].checkedId.split(',')[1]
      list.splice(index, 1)
      this.setData({
        'orderList_wait.resultList': list
      })
      Toast.success('操作成功')
    })
  },
  /**
   * TODO 反提交
   */
  unPassOrder (e) {
    const params = {
      url: config.unsubmit,
      params: {
        // orderIds: JSON.stringify([parseInt(this.data.tabs[this.data.active].checkedId)])
        orderId: parseInt(this.data.tabs[this.data.active].checkedId)
      }
    }
    app.nPost(params).then(res => {
      // console.log(res)
      let list = this.data.orderList_ed.resultList
      let index = this.data.tabs[this.data.active].checkedId.split(',')[1]
      list.splice(index, 1)
      this.setData({
        'orderList_wait.resultList': list
      })
      Toast.success('操作成功')
    })
  },
  // cellTap (e) {
  //   console.log(e)
  //   // wx.navigateTo({
  //   //   // url: '/pages/orderDetailList/index?orderType=' + '03' + '&orderID=' + e.currentTarget.dataset.data.orderId,
  //   //   url: `/pages/orderDetailList/index?orderType=03&orderID=${e.detail}`,
  //   // });
  // }
})