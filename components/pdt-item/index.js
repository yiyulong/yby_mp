//pdt-item.js
Component({
  externalClasses: ['custom-class'],
  properties: {
    pdt: Object
  },
  methods: {
    _jumpPdt ({ currentTarget: { dataset: { id } } }) {
      if (id) {
        wx.navigateTo({
          url: `/pages/pdtInfo/index?productId=${id}`
        })
      };
    }
  }
})
