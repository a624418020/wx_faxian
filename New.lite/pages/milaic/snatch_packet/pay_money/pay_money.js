// pages/milaic/snatch_packet/pay_money/pay_money.js
const recorderManager = wx.getRecorderManager()//录音
const innerAudioContext = wx.createInnerAudioContext()
const app = getApp()
var timestamp//用来保存按键按下时的时间戳，如果小于1S就不提交
var record_length//录音取整的长度
var touch//防止按下
var loose//防止松掉触发
var touch_o//防止其它按钮多次点击
var touch_k//防止其它按钮多次点击
var PI = {};
var password_text//口令
var packet_id;//红包id
var max = 0;//最大查询次数
var tempFilePath;
var recordId=0, record=true;//全局保存录音ID和当前播放状态
var onlyone //防止error多次误触发
Page({
  /**
   * 页面的初始数据
   */
  data: {

    sy_counts: '',//剩余次数
    total_money: '0.00',//总金额
    onPlay: -1,//语音1是播放中
    frequency: '0',
    partake: 0,//0正常显示分享按钮，如果为1就就是测试版本，就把分享按钮隐藏掉。
    rule_pop: false,//活动规则弹窗，默认不显示
    success_pop: false,//语音识别成功弹窗
    sy_counts: 0,//剩余次数默认是0
    failure_pop: false//语音识别失败弹窗
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    onlyone = true
    //如果从分享和无线二维码中都没有获取到packet_id，那么就提示没有获取到红包ID
    if (options.packet_id == "" || options.packet_id == null || options.packet_id == undefined) {
      var scene = decodeURIComponent(options.scene)//获取扫码的二维码内容
      if (scene == "undefined" || scene == null || scene == undefined || scene == '') {
        wx.showModal({
          title: '提示',
          content: '没有获取到红包ID，请重新点击分享进入',
          success: function (res) {
          }
        })
      } else {
        packet_id = scene
        console.log('scene', scene)
      }
    } else {
      packet_id = options.packet_id
    }
    console.log('globalData', app.globalData)
    touch = true;//防止语音口令查询中多次按下
    loose = true;//防止语音口令查询中多次按下
    touch_o = true//防止其它按钮多次按下
    touch_k = true
    try {
      PI = wx.getStorageSync('PI')
      if (PI == null || PI == undefined || PI == "") {
        dinshi(that, 6)
      } else {
        my_login(that)
      }
    } catch (e) {
      login(that)//获取用户信息
    }
    authorize()//提示用户授权
  },
  onReady: function () {
    if (app.globalData.debug == 1) {
      this.setData({
        partake: 1
      })
      console.log("分享", this.data.partake)
    }
  },
  //分享
  onShareAppMessage: function () {
    console.log("分享", packet_id)
    return {
      title: '发现一个大红包',
      path: 'pages/milaic/snatch_packet/pay_money/pay_money?packet_id=' + packet_id
    }
  },

  bindtouchstart: function () {
    console.log('按下', touch)
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
      if (this.data.sy_counts > 0 && touch) {
        touch = false
        wx.showLoading({
          title: '录音中',
        })
        //时间戳
        timestamp = (new Date()).valueOf()
        //防止疯狂点击

        //改变控件颜色
        this.setData({
          button_style: 'background: #3E7B43;color: #4FA456;'
        })

        //正常情况下进来就直接注册，如果没有注册就再次进入注册接口
        if (PI.openId == null || PI.openId == undefined || PI.openId == "") {
          login(that)//获取用户信息 
        } else {

          let that = this

          console.log('开始录音')
          const options = {
            duration: 10000,//最大录音时长
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 48000,
            format: 'mp3',
          }
          //开始录音
          recorderManager.start(options)
          recorderManager.onStart(() => {

          });
          //调用录音失败
          recorderManager.onError((res) => {
            if (onlyone) {
              console.log('res', res)
              onlyone = false;
              wx.hideLoading()//取消Loading
              wx.showModal({
                title: '提示',
                content: '起吊录音失败，请点击确定查看是否给予录音权限. \n onError:' + res.errMsg,
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: (res) => {
                        onlyone = true
                      }
                    })
                  } else if (res.cancel) {
                    onlyone = true
                    console.log('用户点击取消')
                  }
                }
              })
              console.log(res);
            }
            touch = true//如果调用录音失败开启打开按钮
            loose = true
            console.log('调用录音失败');
          })
        }
      }
    }
  },
  //抬起按钮
  bindtouchend: function () {
    console.log('抬起', loose)
    if (touch_k) {
      touch_k = false
      setTimeout(function () {
        touch_k = true
      }, 1000)
      if (this.data.sy_counts > 0 && loose && !touch) {
        loose = false//先禁止掉
        var that = this
        wx.hideLoading()//取消Loading 
        that.setData({
          button_style: ''//样式变回正常
        })

        // if (onlyone) {
        console.log('停止录音')
        //错误回调
        recorderManager.stop();
        recorderManager.onStop((res) => {
          // tempFilePath = res.tempFilePath;
          if ((new Date()).valueOf() - timestamp < 1000) {
            wx.showToast({
              title: '按下时间过短',
              image: '/images/false.png',
              duration: 2000
            })
            touch = true//按下时间过短不发送语音，按钮可以继续按了
            loose = true
            console.log('按下时间过短不发送语音');
          } else {
            record_length = Math.round(((new Date()).valueOf() - timestamp) / 1000) 
            setdata(res.tempFilePath, that)
          }
          console.log('停止录音', res.tempFilePath)
        })
      }
      // }
    }
  },
  /**下面是一堆点击按钮 */
  //点击了活动规则
  rule_bt: function () {
    this.setData({
      rule_pop: true,
    })
  },
  //退出按钮
  abort: function () {
    this.setData({
      rule_pop: false,//活动规则弹窗，默认不显示
      success_pop: false,//语音识别成功弹窗
      failure_pop: false//语音识别失败弹窗
    })
  },
  //提现按钮
  cash_bt: function () {
    //一秒内只能重复一次
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
        wx.navigateTo({
          url: '../collectmoney/collectmoney?Amount=' + this.data.total_money
        })
    }
  },
  //分享按钮
  share_bt: function () {
    //一秒内只能重复一次
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
      wx.navigateTo({
        url: '/pages/milaic/snatch_packet/partake/partake?packet_id=' + packet_id + '&password_text=' + password_text
      })
    }
  },
  //我也发一个
  generate_money: function () {
    //一秒内只能重复一次
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
      wx.redirectTo({
        url: '/pages/milaic/snatch_packet/generate_money/generate_money'
      })
    }
  },
  //语音播放
  voice:function(e){
    //一秒内只能重复一次
    var that=this
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 500)

      if (this.data.log_list[e.currentTarget.dataset.id].save_path==recordId){
        console.log('222222')
        record = !record;//取反播放状态
        console.log('33333', record)
        if (record){
          innerAudioContext.play();

        }else{
          console.log('33333')
          innerAudioContext.stop();
        }
      }else{
        recordId = this.data.log_list[e.currentTarget.dataset.id].save_path//当前录音ID
        innerAudioContext.src = 'https://fangche.domobile.net/Public/' + packet_id + '/' + this.data.log_list[e.currentTarget.dataset.id].save_path + '.mp3'
        record=true;
        console.log('11111111111')
        innerAudioContext.play();
      }

      console.log('https://fangche.domobile.net/Public/' + packet_id + '/' + recordId + '.mp3')
      innerAudioContext.onPlay(() => {
        that.setData({
          onPlay:e.currentTarget.dataset.id
        })
        console.log('开始播放')
      })
      innerAudioContext.onStop(() => {
        that.setData({
          onPlay: -1
        })
        console.log('停止播放')
      })
      innerAudioContext.onEnded(() => {
        that.setData({
          onPlay: -1
        })
        console.log('停止播放')
      })
      
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })

    }
  }


})
//提交音频接口 salt就是音频唯一识别口
function setdata(url, that) {
  wx.showLoading({
    title: '识别中',
    mask: true,
  })
  let salt = PI.openId + (new Date()).valueOf()
  let timeout_data = 1000 + (parseInt(1000 * Math.random()))
  console.log('timeout_data ', timeout_data)
  console.log(url)
  console.log('PI', PI)
  wx.uploadFile({
    url: 'https://fangche.domobile.net/Api/Redball/play_game',
    filePath: url,
    name: 'file',
    formData: {
      'open_id': PI.openId,
      'salt': salt,
      'coupon_id': packet_id,
      'nickname': PI.nickName,
      'avatar': PI.avatarUrl,
      'voice_time': record_length
    },
    success: function (res) {
      console.log('提交', res)
      /**等待一段时间再去查询 */
      setTimeout(function () {
        /**1.在1S到2S中随机一个数延迟时间后调用查询接口，如果成功直接显示，如果不成功，后每隔1S调用一次查询接口，一共调用5次 */
        query(salt, that)
      }, timeout_data)

    },
    fail: function (e) {
      timeout()//超时
    },
  })
}

//获取注册到后台
function my_login(that) {
  wx.login({
    success: function (res) {
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
          //如果接口不是200那么就弹窗提示，
          if (mistaken(res)) {
            return
          }
          inquire(that)//查询红包信息
          console.log('注册', res)
        },
        fail: function (e) {
          timeout()//超时
        },
      })
    }
  })
}

//查询--注册--列表--游戏次数
function inquire(that) {
  //用户第一次进入，在onshow的时候没有拿到用于ID，所以不让进入
  if (PI.openId == undefined || PI.openId == null || PI.openId == '') {
    return
  }
  wx.request({
    url: "https://fangche.domobile.net/Api/Redball/start_game",
    data: {
      open_id: PI.openId,
      coupon_id: packet_id
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      console.log('start_game', res)
      //如果接口不是200那么就弹窗提示，
      if (mistaken(res)) {
        return
      }
      wx.hideLoading()
      /**红包的一些基础信息 */
      try {
        password_text = res.data.result.say
        let packet = {};
        packet.total = res.data.result.money//红包总金额
        packet.total_n = res.data.result.number//红包总个数
        packet.number = packet.total_n - res.data.result.surplus_num//红包剩余个数
        that.setData({
          sponsor_avatar: res.data.result.sponsor_avatar,//用户头像
          sponsor_name: res.data.result.sponsor_name,//用户名称
          log_list: setdate(res.data.result.log_list),//抢红包人的信息
          packet: packet,//红包总体信息
          say: res.data.result.say//红包口令
        })
      } catch (e) {
        wx.showToast({
          title: '红包丢失',
          image: '/images/false.png',
          duration: 2000
        })
        that.setData({
          sy_counts: -1,
          head_bt_end:'红包丢失'
        })
      }
      /**status为0也就是没有付款成功 */

      if (res.data.result.status == 0) {
        that.setData({
          sy_counts: -1,
          head_bt_end: '红包尚未生效'
        })
        return
      }
      //已经玩过
      if (res.data.result.user_coupon.length > 0) {
        that.setData({
          sy_counts: 0,//剩余次数
          total_money: res.data.result.user_coupon[0].money,//总金额
        })
        return
      }
      //已经失效
      if (res.data.result.status != 1){
        that.setData({
          sy_counts: -1,
          head_bt_end: '红包已经失效'
        })
        return
      }
      //被抢完了
      if (res.data.result.surplus_num <1) {
        that.setData({
          sy_counts: -1,
          head_bt_end: '红包已经被一抢而空'
        })
        return
      }
      if (res.data.result.user_coupon.length == 0) {
        that.setData({
          sy_counts: 1,//剩余次数
        })
      } 

    },
    fail: function (e) {
      wx.hideLoading()//取消Loading
      timeout()//超时
    },
  })
}

/**循环查询识别结果 */
function query(salt, that) {
  wx.request({
    url: 'https://fangche.domobile.net/Api/Redball/getInfoBySalt?salt=' + salt,
    data: {
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log('查询', res)
      //如果接口不是200那么就弹窗提示，
      if (mistaken(res)) {
        return
      }
      if (res.data.result == null || res.data.result == undefined || res.data.result == '') {
        wx.showToast({
          title: '查询失败',
          image: '/pages/imgs/false.png',
          duration: 2000
        })
        touch = true
        loose = true
        wx.hideLoading()//取消Loading
        return
      }
      max++//最多再查询5次
      if (max >= 6) {
        wx.showModal({
          title: '提示',
          content: '当前网络繁忙，请稍后查看游戏结果',
          success: function (res) {
          }
        })
        max = 0//清掉
        touch = true
        loose = true
        wx.hideLoading()//取消Loading
        return
      }
      if (res.data.result.status == "0" && max < 6) {
        /**还在查询中 */
        console.log('应该继续执行')
        setTimeout(function () {
          /**如果没有查询到数据就隔一秒后再次调用这个接口 */
          query(salt, that)
        }, 1000)

      } else if (res.data.result.status == "1") {
        max = 0;//如果查询到了剩余次数清零
        touch = true//按钮可以继续按
        loose = true
        inquire(that)//查询结果
        wx.hideLoading()//取消Loading
        that.setData({
          coin: res.data.result.money.toFixed(2)//本次红包金额
        })
        /**正确 */
      } else {
        touch = true
        loose = true
        max = 0;//如果没有查询到了剩余次数清零
        wx.hideLoading()//取消Loading
        inquire(that)//查询游戏剩余次数
        wx.showToast({
          title: '再接再厉',
          image: '/images/pic_face_cry.png',
          duration: 2000
        })
        /**错误 */
      }
    },
    fail: function (e) {
      timeout()//超时
      // fail
    },
    complete: function () {

    }
  })
}


//录音授权
function authorize() {
  console.log('调用授权')
  wx.authorize({
    scope: 'scope.record',
    success() {
      console.log('同意授权')
      // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    }
  })
}


/**工具类 */
//网络错误连接提示
function timeout() {
  wx.hideLoading()//取消Loading
  wx.showModal({
    title: '提示',
    content: '网络连接超时',
  })
  touch = true
  loose = true
}
//接口回调不是200
function mistaken(res) {
  console.log('接口不是200', res)
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
//时间转换
function setdate(data) {
  for (var key in data) {
    data[key].create_time = formatDate(data[key].create_time)
  }
  return data
}
function formatDate(time) {
  var now = new Date(time * 1000)
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (hour >= 1 && hour <= 9) {
    hour = "0" + hour;
  }
  if (minute >= 0 && minute <= 9) {
    minute = "0" + minute;
  }
  return month + "月" + date + "日 " + hour + ":" + minute
}



//获取用户uid
function dinshi(that, num) {
  var name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      my_login(that)
      clearInterval(name);
    } else if (num == 0) {
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
