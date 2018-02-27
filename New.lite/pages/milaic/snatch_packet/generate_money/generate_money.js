// pages/milaic/snatch_packet/generate_money/generate_money.js
var money, mynumber
var app = getApp();
var password_id;
var password_text;//口令对应的id
var PI = {};
var utilMd5 = require('../../../../utils/hexMD5.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    password: '',//口令
    serviceFee:'0.00',
    charge:'生成语音口令',
    prompt:false,//默认不提示金额1~200之间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    password_list(that);
    try {
      PI = wx.getStorageSync('PI')
      if (PI == null || PI == undefined || PI == "") {
        PI = {}
        dinshi(that, 6)//获取用户信息
      } else {
        that.setData({
          avatar: PI.avatarUrl,
        })
        my_login(that)//注册到红包列表上
        console.log('11')
      }
    } catch (e) {
      dinshi(that, 6)//获取用户信息
    }
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    console.log('获取到口令名称以及ID', app.globalData.snatch_packet_id)
    if (app.globalData.snatch_packet_id == '' || app.globalData.snatch_packet_id == null || app.globalData.snatch_packet_id == undefined) {
    } else {
      password_id = app.globalData.snatch_packet_id.id
      password_text = app.globalData.snatch_packet_id.text
      this.setData({
        password: password_text
      })
    }
  },
  //去提现
  income: function () {
    wx.navigateTo({
      url: '../collectmoney/collectmoney'
    })
  },
  //跳转口令列表
  password_list: function () {
    wx.navigateTo({
      url: '../password_list/password_list'
    })
  },
  //获取金额
  money: function (e) {
    let charge=0;
    let serviceFee=0;//服务费
    let that=this;
    money = e.detail.value//保存金额
    console.log(money.split("."))
    let prompt = [];
    prompt[0]=true;
    prompt[1] = '赏金应为1到200元之间';
    if (money == 0 || money == '.'){
      return ''
    }
    if (money < 1||money>200){
      this.setData({
        prompt: prompt
      })
      setTimeout(function () {
        prompt[0] = false;
        that.setData({
          prompt: prompt
        })
      }, 2000)
    }
    if (money.split(".").length == 2){
      if (money.split(".")[1].length > 2) {
        console.log('长度超过', money.substr(0, money.indexOf(".") + 3));//超出小数点后3位则删除第3位
        return money.substr(0, money.indexOf(".") + 3);
      }
    }
    charge = (money*1) + (money*0.02)//应该付的钱
    console.log(money, money * 0.02)
    this.setData({
      serviceFee: (money * 0.02).toFixed(2),
      charge: '还需支付'+charge.toFixed(2)+'元'
    })

  },
  //获取红包个数
  number1: function (e) {
    let that=this
    console.log(e.detail.value)
    mynumber = e.detail.value//保存个数
    let prompt = [];
    prompt[0] = true;
    prompt[1] = '数量应为1到99之间';
    if (mynumber == 0) {
      return ''
    }
    if (mynumber < 1 || mynumber > 99) {
      this.setData({
        prompt: prompt
      })
      setTimeout(function () {
        prompt[0] = false;
        that.setData({
          prompt: prompt
        })
      }, 2000)
    }
  },
  //付钱
  bt: function () {
    if (money == undefined || money == null || money < 1 || money > 200) {
      wx.showToast({
        title: '赏金填写有误',
        image: '/images/false.png',
        duration: 2000
      })
      return
    }
    if (mynumber == undefined || mynumber == null || mynumber < 1 || mynumber >99 ) {
      wx.showToast({
        title: '数量填写有误',
        image: '/images/false.png',
        duration: 2000
      })
      return
    }
    if (money / mynumber<0.1){
      wx.showToast({
        title: '人均不小于0.1元',
        image: '/images/false.png',
        duration: 2000
      })
      return
    }
    //生成红包
    generate(money, mynumber);

  },
  //跳转到历史记录
  cash_bt:function(){
    wx.navigateTo({
      url: '/pages/milaic/snatch_packet/historical_records/historical_records'
    })
  }



})
function generate(money, mynumber) {
  console.log(
    '-open_id-', PI.openId,//id
    '-sponsor_name-', PI.nickName,//id
    '-sponsor_id-', PI.id,//人物自增id
    '-sponsor_avatar-', PI.avatarUrl,//人物头像
    '-option_id', password_id,//口令ID
    '-say-', password_text,
    '-number-', mynumber,//多少个
    '-money-', money,//多少钱
  )
  wx.request({
    url: 'https://fangche.domobile.net/Api/Redball/inserRedball',
    data: {
      open_id: PI.openId,
      sponsor_id: PI.id,
      sponsor_avatar: PI.avatarUrl,
      sponsor_name: PI.nickName,
      option_id: password_id,
      say: password_text,
      number: mynumber,
      money: money,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log('generate回调', res)
      if (mistaken(res)) {
        return
      }
      if (res.data.result.prepay_id == null || res.data.result.prepay_id == undefined || res.data.result.prepay_id==''){
        wx.showToast({
          title: '获取订单失败',
          image: '/images/false.png',
          duration: 2000
        })
        return
      }else{
        requestPayment(res.data.result.prepay_id, res.data.result.id)//支付接口
      }
    },
    fail: function (res) {
      console.log("获取数据失败", res)
    },
    complete: function (res) {
    }
  })
}
//获取口令列表
function password_list(that) {
  wx.request({
    url: 'https://fangche.domobile.net/Api/Redball/getOptionList',
    data: {
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      //如果接口不是200那么就弹窗提示，
      var password_list = [], password_left = [], password_right = []
      if (mistaken(res)) {
        return
      }
      for (var key in res.data.result) {
        console.log('key', key)
        if (res.data.result[key].pid == 0) {
          password_left.push(res.data.result[key])
        } else {
          password_right.push(res.data.result[key])
        }
      }
      password_list[0] = password_left.reverse();
      password_list[1] = password_right;
      password_id = password_list[1][0].id
      password_text = password_list[1][0].text
      that.setData({
        password: password_text,
      })
      console.log('res1111', password_list)
    },
    fail: function (res) {
      console.log("获取数据失败", res)
      wx.showModal({
        title: '提示',
        content: '获取数据失败11',
      })
    },
    complete: function (res) {
    }
  })
}
//获取用户uid
function dinshi(that, num) {
  wx.showLoading({
    title: '加载中',
    mask: true,
  })
  var name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      my_login(that)
      clearInterval(name);
    } else if (num == 0) {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '网络连接超时',
        success: function (res) {
        }
      })
      clearInterval(name);
    }
  }, 1000);
}
//获取注册到后台
function my_login(that) {
  wx.request({
    url: "https://fangche.domobile.net/Api/Redball/regist",
    data: {
      open_id: PI.openId,
      nickname: PI.nickName,
      avatar: PI.avatarUrl,
      sex: PI.gender
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      wx.hideLoading()
      //如果接口不是200那么就弹窗提示，
      if (mistaken(res)) {
        return
      }
      console.log('注册', res)
      that.setData({
        avatar: PI.avatarUrl,
      })
    },
    fail: function (e) {
      wx.hideLoading()
      timeout()//超时
    },
  })
}
//接口回调不是200
function mistaken(res) {
  console.log('所有回调', res)
  try {
    if (res.statusCode != 200) {
      wx.showToast({
        title: res.errMsg,
        image: '/images/false.png',
        duration: 2000
      })
      return true
    }
    if (res.data.code != 200) {
      wx.showToast({
        title: res.data.msg,
        image: '/images/false.png',
        duration: 2000
      })
      return true
    }
    if (res.data.code == 200) {
      return false
    }
    console.log('接口回调判别方法', res)
    wx.showToast({
      title: '接口回调失败',
      image: '/images/false.png',
      duration: 2000
    })
    return true
  } catch (e) {
    console.log('接口回调判别方法', res)
    wx.showToast({
      title: '接口回调失败',
      image: '/images/false.png',
      duration: 2000
    })
    return true
  }
}
function requestPayment(prepay_id, packet_id){
  let appid ='wxa9f5672aa584035c';
  let key ='MilaiMiyaoWasdq2018werzxd6666666';
  let timeStamp = Math.floor((new Date()).valueOf() / 1000)+'';//时间戳
  let nonceStr ='5K8264ILTKCH16CQ2502S00ZNMTM67VS';//字符串
  let mypackage = 'prepay_id=' + prepay_id;//订单编号
  let paySign = 'appId=' + appid + '&nonceStr=' + nonceStr + '&package=' + mypackage + '&signType=MD5&timeStamp=' + timeStamp + '&key=' + key;
  console.log('paySign', paySign)
   paySign = (utilMd5.hexMD5(paySign)).toUpperCase()
  console.log(
    '----timeStamp----', timeStamp,
    '----nonceStr----', nonceStr,
    '----package----', mypackage,
    '----paySign----', paySign,
  )
  wx.requestPayment({
    'timeStamp': timeStamp,
    'nonceStr': nonceStr,
    'package': mypackage,
    'signType': 'MD5',
    'paySign': paySign,
    'success': function (res) {
      console.log('支付成功',res)
      wx.redirectTo({
        url: '/pages/milaic/snatch_packet/partake/partake?packet_id=' + packet_id + '&password_text=' + password_text
      })
    },
    'fail': function (res) {
      console.log('支付失败',res)
      wx.showToast({
        title: '支付失败',
        image: '/images/false.png',
        duration: 2000
      })
    },
    'complete': function (res) {
      console.log('complete', res)
     }
  })
}
