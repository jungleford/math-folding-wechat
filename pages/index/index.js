//index.js
//获取应用实例
const app = getApp()

Page({
  //事件处理函数
  bindViewTap: function(event) {
    let pageName = event.target.id;
    wx.navigateTo({
      url: '../' + pageName + '/' + pageName
    })
  }
})
