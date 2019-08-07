// components/goto/goto.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: {
      type: String,
      value: '返回'
    },
    show: {
      type: Boolean,
      value: true
    },
    where: String || Object, // 官方API wx.pageScrollTo()的参数，或者代表选择器的字符串
    delegate: {
      type: Boolean,
      value: true // 是否本组件全权处理
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    position: { scrollTop: 0 } // 默认回到顶部
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached: function () {
      let where = this.data.where;
      if (typeof where === 'string' && where != '') {
        this.setData({
          position: { selector: where }
        });
      } else if (where) {
        this.setData({ position: where });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goto: function (e) {
      if (this.data.delegate) {
        wx.pageScrollTo(this.data.position);
      } else {
        this.triggerEvent('tap', { where: this.data.where });
      }
    }
  }
})
