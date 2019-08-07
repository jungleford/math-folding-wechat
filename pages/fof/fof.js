// pages/fof/fof.js
const serviceConstants = require('@jungleford/math-folding').Constants;
const Folding = require('@jungleford/math-folding').FOF;
const utils = require('@jungleford/simple-utils').Utils;
const _ = require('@jungleford/simple-utils').Libs._;
const uiConstants = require('../../utils/constants.js');

const language = wx.T.getLanguage();

const algorithms = [];
_.each(serviceConstants.algorithm, alg => {
  algorithms.push({id: alg, name: language[alg]});
});

const uis = [];
_.each(uiConstants.style, ui => {
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
    colors: utils.generateGradualColors(defaultService.getCount()), // 一维数组

    done: false,

    number: 1,
    position: 1,
    valueOf: 1,
    positionOf: 1,

    stepsContent: [], // 三维数组
    stepsContentReverse: [], // 三维数组

    showGoto: false,
    gotoWhere: ''
  },

  // 非delegate模式，防止组件接管tap事件直接跳到顶部
  goto: function (where) {
    wx.pageScrollTo({ selector: this.data.gotoWhere });
  },

  /*
   * 内部方法：显示/隐藏“返回”按钮
   */
  toggleGoto: function (id, open) {
    let alg = this.data.algorithm.id;
    let power = this.data.power;
    if ((id === 'steps' || id === 'reverse') && power > 3) {
      this.setData({
        showGoto: open,
        gotoWhere: open ? '#' + id : ''
      });
    }
  },

  /**
   * 展开/收起一个区块
   */
  toggleBlock: function (e) {
    let list = this.data.list;
    let id = e.currentTarget.id

    _.each(list, item => {
      if (item.id === id) {
        item.open = !item.open;
        this.toggleGoto(id, item.open);
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
    let list = this.data.list;
    let value = e.detail.value;
    let algorithm = this.data.algorithms[value];
    let introOpen = algorithm.id === this.data._algorithms.FORMULA;
    let resetOriginal = service.init(true);
    serviceReverse = null;

    _.each(list, item => {
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

      done: false,

      number: 1,
      position: 1,
      valueOf: 1,
      positionOf: 1,

      stepsContent: [],
      stepsContentReverse: []
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
    let list = this.data.list;
    let newPower = parseInt(e.detail.value) + 1;
    service = new Folding(newPower); // 更新service
    let resetOriginal = service.init();
    let count = service.getCount();
    serviceReverse = null;

    _.each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }

      if (item.id === 'steps' || item.id === 'reverse') {
        item.open = false;
      }
    });

    this.setData({
      list: list,

      power: newPower,
      count: count,

      original: resetOriginal,
      result: resetOriginal,
      colors: utils.generateGradualColors(count),

      done: false,

      number: 1,
      position: 1,
      valueOf: 1,
      positionOf: 1,

      stepsContent: [],
      stepsContentReverse: []
    });
    console.debug('当前幂次：' + this.data.power);
  },

  /**
   * 开始折叠
   */
  doFolding: function (e) {
    if (this.data.done) {
      return;
    }

    let list = this.data.list;
    let alg = this.data.algorithm.id;
    let result = service.compute(alg);
    serviceReverse = new Folding(this.data.power, result);
    serviceReverse.compute(alg);

    _.each(list, item => {
      if (item.id === 'final' || item.id === 'explore') {
        item.visible = true;
      }

      if (item.id === 'initial' || item.id === 'final' || item.id === 'explore') {
        item.open = true;
      }

      if (alg === serviceConstants.algorithm.RECURSIVE && (item.id === 'steps' || item.id === 'reverse')) {
        item.visible = true;
      }
    });

    this.setData({
      list: list,

      result: result,

      done: true,

      stepsContent: alg === serviceConstants.algorithm.RECURSIVE ? service.getSteps() : [],
      stepsContentReverse: alg === serviceConstants.algorithm.RECURSIVE ? serviceReverse.getSteps() : []
    });
  },

  /**
   * 重置界面
   */
  reset: function (e) {
    let list = this.data.list;

    _.each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }

      if (item.id === 'steps' || item.id === 'reverse') {
        item.open = false;
      }
    });

    this.setData({
      list: list,

      result: this.data.original,

      done: false,

      stepsContent: [],
      stepsContentReverse: []
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
});