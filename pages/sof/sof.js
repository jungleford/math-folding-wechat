// pages/sof/sof.js
const serviceConstants = require('@jungleford/math-folding').Constants;
const Folding = require('@jungleford/math-folding').SOF;
const utils = require('@jungleford/simple-utils').Utils;
const _ = require('@jungleford/simple-utils').Libs._;
const uiConstants = require('../../utils/constants.js');

const language = wx.T.getLanguage();

const algorithms = [];
_.each(serviceConstants.algorithm, alg => {
  algorithms.push({ id: alg, name: language[alg] });
});

const uis = [];
_.each(uiConstants.style, ui => {
  uis.push({ id: ui, name: language[ui] });
});

const defaultPower = 3;
const maxPower = 5;
const defaultService = new Folding(defaultPower);
const defaultColors = utils.generateGradualColorMatrix(defaultService.getRowCount());

// 对于data内的私有字段，它仅能保存primitive类型值或可以JSON序列化的对象。
// 至于在FOF和SOF中定义的方法经过setData()之后都会丢失。
// 因此service对象不得不定义在此。
let service = defaultService;

/* for SOF k=1, there are 2 rounds back to the initial matrix.
   for SOF k=2, there are 3 rounds back to the initial matrix.
   for SOF k=3, there are 27 rounds back to the initial matrix. */
let countReverse = [2, 3, 27];

function getResultColors(colors, result) {
  let colorSet = _.reduce(colors, (accumulator, row) => accumulator.concat(row)); // colors of original matrix
  return _.map(result, row => _.map(row, number => colorSet[number - 1])); // keep same color for each number
}

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
        name: '初始方阵',
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
    count: defaultService.getCount(), // 4^k
    rowCount: defaultService.getRowCount(), // 2^k

    normalWidth: 2 * (16 + Math.pow(2, defaultPower - 1)),

    original: defaultService.init(), // 二维数组
    result: defaultService.init(), // 二维数组
    resultFlat: utils.matrixToArray(defaultService.init()), // 一维数组
    colors: defaultColors, // 二维数组
    flatColors: utils.matrixToArray(defaultColors), // 一维数组
    resultColors: [], // 二维数组
    resultShape: 'line',

    done: false,

    number: 1,
    position: 1,
    valueOf: 1,
    positionOf: 1,

    stepsContent: [], // 四维数组
    stepsContentReverse: [] // 三维数组
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
      resultFlat: utils.matrixToArray(resetOriginal),
      resultColors: [],
      resultShape: 'line',

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

    _.each(list, item => {
      if (item.id === 'final' || item.id === 'explore' || item.id === 'steps' || item.id === 'reverse') {
        item.visible = false;
      }

      if (item.id === 'steps' || item.id === 'reverse') {
        item.open = false;
      }
    });

    let colors = utils.generateGradualColorMatrix(service.getRowCount());
    let flatColors = utils.matrixToArray(colors);

    this.setData({
      list: list,

      power: newPower,
      count: service.getCount(),
      rowCount: service.getRowCount(),

      normalWidth: 2 * (16 + Math.pow(2, newPower - 1)),

      original: resetOriginal,
      result: resetOriginal,
      resultFlat: utils.matrixToArray(resetOriginal),
      colors: colors,
      flatColors: flatColors,
      resultColors: [],
      resultShape: 'line',

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
    let power = this.data.power;
    let resultFlat = service.compute(alg)[0];
    let result = utils.arrayToMatrix(resultFlat);

    let stepsContentReverse = [];
    if (this.data.stepsContentReverse.length === 0) {
      for (let i = 0, count = countReverse[power - 1], svc = service; i <= count; i++) {
        svc = new Folding(power, svc.compute(alg)[0], true);
        stepsContentReverse.push(svc.init());
      }
    }

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

    let resultColors = getResultColors(this.data.colors, result);

    this.setData({
      list: list,

      result: result,
      resultFlat: resultFlat,
      resultColors: resultColors,

      done: true,

      stepsContent: alg === serviceConstants.algorithm.RECURSIVE ? service.getSteps() : [],
      stepsContentReverse: stepsContentReverse
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
      resultColors: [],
      resultShape: 'line',

      done: false,

      stepsContent: [],
      stepsContentReverse: []
    });
  },

  changeShape: function (e) {
    this.setData({ resultShape: this.data.resultShape === 'line' ? 'square' : 'line' })
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