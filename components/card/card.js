// components/card.js
const utils = require('@jungleford/simple-utils').Utils;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    width: Number, // unit is rpx
    background: String, // 6 digits hex color code
    content: Number || Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    foreground: '#000000'
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached: function () {
      this.setData({
        foreground: utils.getReverseColor(this.data.background)
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
