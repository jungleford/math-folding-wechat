// pages/fof/fof.js
const _each = require('lodash.foreach'); // 直接import lodash有错误，需要分别导入小包
const serviceConstants = require('@jungleford/math-folding').Constants;
const Folding = require('@jungleford/math-folding').FOF;
const utils = require('@jungleford/simple-utils').Utils;
const uiConstants = require('../../utils/constants.js');

const language = wx.T.getLanguage();

const algorithms = [];
_each(serviceConstants.algorithm, alg => {
  algorithms.push({id: alg, name: language[alg]});
});

const uis = [];
_each(uiConstants.style, ui => {
  uis.push({id: ui, name: language[ui]});
});

const defaultPower = 3;
const maxPower = 5;
const defaultService = new Folding(defaultPower);

// 对于data内的私有字段，它仅能保存primitive类型值或可以JSON序列化的对象。
// 至于在FOF和SOF中定义的方法经过setData()之后都会丢失。
// 因此service对象不得不定义在此。
let service = defaultService;
let serviceReverse = null;

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
        id: 'intro',
        name: '计算方法',
        open: true,
        visible: false
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

    original: defaultService.init(), // 一维数组
    result: defaultService.init(), // 一维数组
    resultReset: true,
    colors: utils.generateGradualColors(defaultService.getCount()), // 一维数组

    number: 1,
    position: 1,
    valueOf: 1,
    positionOf: 1,

    activeStep: 0,
    activeStepContent: [],

    resultReverse: null,
    activeStepReverse: 0,
    activeStepContentReverse: []
  },

  /**
   * 展开/收起一个区块
   */
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

  /**
   * 切换算法
   */
  changeAlgorithm: function (e) {
    let value = e.detail.value;
    let list = this.data.list;
    let algorithm = this.data.algorithms[value];
    let introOpen = algorithm.id === this.data._algorithms.FORMULA;
    let resetOriginal = service.init(true);
    serviceReverse = null;

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      } else if (item.id === 'intro') {
        item.visible = introOpen;
        item.open = introOpen;
      } else {
        item.open = true;
      }
    });

    this.setData({
      list: list,

      algorithm: algorithm,

      original: resetOriginal,
      result: resetOriginal,
      resultReset: true,

      number: 1,
      position: 1,
      valueOf: 1,
      positionOf: 1,

      activeStep: 0,
      activeStepContent: [],

      resultReverse: null,
      activeStepReverse: 0,
      activeStepContentReverse: []
    });

    console.debug('当前算法：' + this.data.algorithm.id);
  },

  /**
   * 切换样式
   */
  changeStyle: function (e) {
    let value = e.detail.value;

    this.setData({
      ui: this.data.uis[value]
    });

    console.debug('当前样式：' + this.data.ui.id);
  },

  /**
   * 设定k值
   */
  changePower: function (e) {
    let newPower = parseInt(e.detail.value) + 1;
    service = new Folding(newPower); // 更新service
    let resetOriginal = service.init();
    let count = service.getCount();
    serviceReverse = null;
    let list = this.data.list;

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }
    });

    this.setData({
      list: list,

      power: newPower,
      count: count,

      original: resetOriginal,
      result: resetOriginal,
      resultReset: true,
      colors: utils.generateGradualColors(count),

      number: 1,
      position: 1,
      valueOf: 1,
      positionOf: 1,

      activeStep: 0,
      activeStepContent: [],

      resultReverse: null,
      activeStepReverse: 0,
      activeStepContentReverse: []
    });
    console.debug('当前幂次：' + this.data.power);
  },

  /**
   * 开始折叠
   */
  doFolding: function (e) {
    let list = this.data.list;
    let result = service.compute(this.data.algorithm.id);
    serviceReverse = new Folding(this.data.power, result);

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore') {
        item.visible = true;
      }

      if (item.id === 'initial' || item.id === 'final' || item.id === 'explore') {
        item.open = true;
      }

      if (this.data.algorithm === serviceConstants.algorithm.RECURSIVE && (item.id === 'steps' || item.id === 'reverse')) {
        item.visible = true;
      }
    });
    this.setData({
      list: list,

      result: result,
      resultReset: false,
      activeStep: 0,
      activeStepContent: this.data.algorithm === serviceConstants.algorithm.RECURSIVE ? service.getSteps() : [],

      resultReverse: serviceReverse.compute(this.data.algorithm.id),
      activeStepReverse: 0,
      activeStepContentReverse: this.data.algorithm === serviceConstants.algorithm.RECURSIVE ? serviceReverse.getSteps() : []
    });
  },

  /**
   * 重置界面
   */
  reset: function (e) {
    let list = this.data.list;

    _each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }
    });
    this.setData({
      list: list,

      result: this.data.original,
      resultReset: true,
      activeStep: 0,

      resultReverse: serviceReverse ? serviceReverse.init() : null,
      activeStepReverse: 0
    });
  },

  changeNumber: function (e) {
    let newNumber = e.detail.value; // value值是从number组件通过triggerEvent传上来的

    if (!service.isComputeDone()) {
      this.setData({ positionOf: 1 });
    } else {
      this.setData({ positionOf: service.positionOf(newNumber) });
    }
  },

  changePosition: function (e) {
    let newPos = e.detail.value; // value值是从number组件通过triggerEvent传上来的

    if (!service.isComputeDone()) {
      this.setData({ valueOf: 1 });
    } else {
      this.setData({ valueOf: service.valueOf(newPos) });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {}
})