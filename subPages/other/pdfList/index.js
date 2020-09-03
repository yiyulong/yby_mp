//pdfList.js
import { getB2bSubPdfProfileInfo } from '../../../ajax/product'
Page({
  onLoad (option) {
    const pdfId = option.id
    getB2bSubPdfProfileInfo({ pdfId }, { showLoading: true }).then(res => {
      console.log(res)
      this.setData({
        pdfList: res
      })
    })
  },
  data: {
    pdfList: []
  },
  _jumpPdf ({ currentTarget: { dataset: { url } } }) {
    wx.navigateTo({
      url: '/subPages/other/webPage/index',
      success (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage_index', { url })
      }
    })
  }
})
