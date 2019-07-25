// pages/fof/fof.js
const _each = require('lodash.foreach'); // 直接import lodash有错误，需要分别导入小包
const serviceConstants = require('@jungleford/math-folding').Constants;
const Folding = require('@jungleford/math-folding').FOF;
const utils = require('@jungleford/simple-utils').Utils;
const uiConstants = require('../../utils/constants.js');

let algorithms = [];
_each(serviceConstants.algorithm, alg => {
  algorithms.push(alg);
});

let uis = [];
_each(uiConstants.style, ui => {
  uis.push(ui);
});

let defaultPower = 3;
let maxPower = 5;
let defaultService = new Folding(defaultPower);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        id: 'option',
        name: '选项',
        open: true,
        visible: true
      }, {
        id: 'question',
        name: '问题',
        open: true,
        visible: true
      }, {
        id: 'param',
        name: '参数',
        open: true,
        visible: true
      }, {
        id: 'initial',
        name: '初始序列',
        open: true,
        visible: true
      }, {
        id: 'final',
        name: '结果序列',
        open: true,
        visible: false
      }, {
        id: 'explore',
        name: '探索',
        open: true,
        visible: false
      }, {
        id: 'steps',
        name: '步骤重现',
        open: false,
        visible: false
      }, {
        id: 'reverse',
        name: '反向折叠',
        open: false,
        visible: false
      }
    ],

    _algorithms: serviceConstants.algorithm,
    algorithms: algorithms,
    algorithm: algorithms[0],
    _uis: uiConstants.style,
    uis: uis,
    ui: uis[0],

    powers: utils.generateNaturalSequence(maxPower),
    power: defaultPower, // k
    count: defaultService.getCount(), // 2^k
    service: defaultService,

    original: defaultService.init(), // an one-dimension array
    result: defaultService.init(), // an one-dimension array
    resultReset: true,
    colors: utils.generateGradualColors(defaultService.getCount()), // an one-dimension array

    number: 1,
    position: 1,

    activeStep: 0,
    activeStepContent: [],

    serviceReverse: null,
    resultReverse: null,
    activeStepReverse: 0,
    activeStepContentReverse: []
  },

  toggleBlock: function (e) {
    let id = e.currentTarget.id
    let list = this.data.list;

    _each(list, item => {
      if (item.id === id) {
        item.open = !item.open;
      } else {
        //item.open = false; // 手风琴模式
      }
    });
    this.setData({
      list: list
    });
  },

  changeOption: function (e) {
    let value = e.detail.value;
    let list = this.data.list;

    this.setData({
      algorithm: this.data.algorithms[value[0]],
      ui: this.data.uis[value[1]]
    });

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }
    });
    this.setData({
      list: list
    });

    console.debug('当前算法：' + this.data.algorithm + '，当前样式：' + this.data.ui);
  },

  changePower: function (e) {
    let newPower = parseInt(e.detail.value) + 1;
    let newService = new Folding(newPower);
    this.setData({
      power: newPower,
      count: newService.getCount(),
      service: newService,

      original: newService.init(),
      result: newService.init(),
      resultReset: true,
      colors: utils.generateGradualColors(newService.getCount()),

      number: 1,
      position: 1,

      activeStep: 0,
      activeStepContent: [],

      serviceReverse: null,
      resultReverse: null,
      activeStepReverse: 0,
      activeStepContentReverse: []
    });
    console.debug('当前幂次：' + this.data.power);
  },

  doFolding: function (e) {
    let list = this.data.list;

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore') {
        item.visible = true;
      }

      if (this.data.algorithm === serviceConstants.algorithm.RECURSIVE && (item.id === 'steps' || item.id === 'reverse')) {
        item.visible = true;
      }
    });
    this.setData({
      list: list
    });
  },

  reset: function (e) {
    let list = this.data.list;

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }
    });
    this.setData({
      list: list
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})