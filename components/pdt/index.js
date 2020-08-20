// components/pdt/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Object
    },
    showMode: {
      type: String,
      value: 'styleName'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _jumpPdt (e) {
      const { productId } = this.data.info
      wx.navigateTo({
        url: `/pages/pdtInfo/index?productId=${productId}`
      })
    }
  }
})