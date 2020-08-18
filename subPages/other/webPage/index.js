//webPage.js
Page({
  onLoad () {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage_index', (data) => {
      this._checkPhone(data.url)
    })
  },
  data: {
    ios: true,
    url: ''
  },
  _checkPhone (url){
    const _this = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        //判断当前机型
        if (res.system.indexOf('iOS')!=-1){
          _this.setData({
            url: url
          })
        }else{
          _this.setData({
            ios:false
          })
          wx.downloadFile({
            url: url,
            success(res){
              let path = res.tempFilePath;
              wx.openDocument({
                filePath: path,
                fileType: 'pdf',
                success(){
                  wx.navigateBack({
                    delta:1
                  })
                }
              })
            }
          })
        }
      }
    })
  }
})
