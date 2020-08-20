// components/oneCellThreePdt/index.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        const showName = app.getValue('productMode')
        if (!showName) return
        this.setData({ showName })
      }
    },
    gutter: {
      type: String,
      value: '10'
    },
    span: {
      type: String,
      value: '12'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showName: ''
  }
})