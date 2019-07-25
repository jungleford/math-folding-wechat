//index.js
Page({
  //事件处理函数
  bindViewTap: function (e) {
    let pageName = e.target.id;
    wx.navigateTo({
      url: '../' + pageName + '/' + pageName
    })
  }
})
