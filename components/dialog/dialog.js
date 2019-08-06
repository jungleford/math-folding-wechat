// components/dialog/dialog.js
// Refer to https://www.jianshu.com/p/8a2a730d9e60
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: 'Title'
    },
    content: {
      type: String,
      value: 'Content'
    },
    cancelText: {
      type: String,
      value: 'Cancel'
    },
    confirmText: {
      type: String,
      value: 'Confirm'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideDialog: function() {
      this.setData({ show: false });
    },

    showDialog: function () {
      this.setData({ show: true });
    },

    cancel: function () {
      this.triggerEvent("cancelEvent")
    },

    confirm: function () {
      this.triggerEvent("confirmEvent");
    }
  }
})
