// components/number-input/number-input.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    inline: {
      type: Boolean,
      value: false
    },
    size: {
      type: String,
      value: 'small' // small | medium | large
    },
    value: {
      type: Number,
      value: 1
    },
    min: {
      type: Number,
      value: -Infinity
    },
    max: {
      type: Number,
      value: Infinity
    },
    step: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    localValue: 1
  },

  /**
   * 组件的生命周期
   */
  lifetimes: {
    attached: function () {
      this.setData({
        localValue: this.data.value
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeValue: function (value) {
      const { min, max } = this.data;

      if (isNaN(value) || value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      }

      this.setData({ localValue: value });
      this.triggerEvent('input', { value: value });
      return '' + value;
    },

    onInput: function (e) {
      let v = e.detail.value;

      if (v && v !== '') {
        let newValue = parseInt(v);
        return this.changeValue(newValue);
      }
    },

    onBlur: function (e) {
      let v = e.detail.value;

      if (!v || v === '') {
        this.setData({ localValue: 1 });
        this.triggerEvent('input', { value: 1 });
        return '1';
      }
    },

    countDown: function () {
      const { localValue, step } = this.data;
      this.changeValue(localValue - step);
    },

    countUp: function () {
      const { localValue, step } = this.data;
      this.changeValue(localValue + step);
    }
  }
})
