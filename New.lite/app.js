//app.js
App({
  onLaunch: function (e) {
    var that = this
    try { that.globalData.scene = e.scene } catch (e) {
      that.globalData.scene = 0
    }
    // wx.login({
    //   success: function (res) {

    //   }
    // })
    //获取当前小程序版本,版本大于1.6.4内页用网页加载
    wx.getSystemInfo({
      success: function (res) {
        var Version = []
        console.log("SDKVersion", res.SDKVersion)
        Version = res.SDKVersion.split('.')
        var data = parseFloat(Version[0] + '.' + Version[1])
        console.log("aa", data)
        if (data > 1.6) {
          that.globalData.SDKVersion = true
        } else if (data == 1.6) { that.globalData.SDKVersion = parseInt(Version[2]) >= 4 ? true : false }
        else that.globalData.SDKVersion = false
      }
    })
    //获取用户信息
    try {
      var res = wx.getStorageSync('PI')
      if (res) {
        that.globalData.PI = res
      } else {
        login(that)
      }
    } catch (e) {
      login(that)
    }
  },
  onShow: function (options) {
    try {
    console.log("apponShow", options)
    if (options && options.referrerInfo) {
      this.globalData.success = true
    }
    } catch (e) {}
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (e) {
          console.log("login", e)
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },



  /* 4位加空格*/
  // Intercept: function (data) {
  //   var a = "", data = data + ""
  //   for (var i = 0; i < (data.length) / 4; i++) {
  //     a = (data.substring(data.length - (i * 4) - 4, data.length - (i * 4)) + " ") + a
  //   };
  //   return a;
  // },

  // time: function (time) {
  //   var date = new Date(time * 1000);
  //   var Y = date.getFullYear() + '-';
  //   var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  //   var D = date.getDate() + ' ';
  //   var h = date.getHours() + ':';
  //   var m = date.getMinutes() + ':';
  //   var s = date.getSeconds();
  //   return (Y + M + D);
  // },
  /*进入途径*/
  from_ft: function (from) {

    console.log("pp.globalData.tel", this.globalData.tel)
    console.log("pp.globalData.PI", this.globalData.PI)
    wx.request({
      url: 'https://a.milaipay.com/merchant/Applet/count',
      data: {
        unionid: this.globalData.PI,
        app_type: 2,
        type: from,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
      },

    })
  },

  // bindPhonenumber: function (str) {
  //   var res = ""
  //   var cursor = 0
  //   var length = str.length
  //   if (length > 3 & (str.trim().charAt(0) == "1")) {
  //     //手机号码
  //     res = str.substring(0, 3) + " "
  //     cursor = 3
  //     length = str.length - 3
  //   }
  //   for (var i = 0; i < (length / 4 - 1); i++) {
  //     cursor = cursor + 4
  //     res = res + str.substring(cursor - 4, cursor) + " "
  //   }
  //   console.log(res + str.substring(cursor, str.length))
  //   return res + str.substring(cursor, str.length)
  // },




  globalData: {
    new: {},
    PI: {},//用户个人信息
    tel: '',//用户手机号码
    success: false,//是否是快拼返回
    is_sc: '3',
    SDKVersion: false,//当前小程序版本
    headid: "",
    scene: "",
    advertising: "",//
    activityID: null,
    ad_id: -1, //目前显示哪个广告
    snatch_packet_id:''//口令红包选择的是哪个口令
  }
})

//登录获取unionId
function login(that) {
  var appid = 'wxa9f5672aa584035c'
  var secret = '784f07488fe02e84300f570bb6cd695e'
  wx.login({
    success: function (res) {
      console.log('信息', res)
      // success
      if (res.code) {
        wx.request({
          url: 'https://a.milaipay.com/Api/Applet/wechats_login',
          data: {
            appid: appid,
            secret: secret,
            js_code: res.code,
            grant_type: 'authorization_code'
          },
          method: 'POST',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            console.log('信息', res)
            var session_key
            var encryptedData
            var iv
            // success
            if (res.data.session_key) {
              session_key = res.data.session_key

              wx.getUserInfo({
                success: function (res) {
                  // success
                  encryptedData = res.encryptedData
                  iv = res.iv
                  wx.request({
                    url: 'https://a.milaipay.com/PHP/demo.php',
                    data: {
                      appid: appid,
                      sessionKey: session_key,
                      encryptedData: encryptedData,
                      iv: iv
                    },
                    method: 'POST',
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                    success: function (res) {
                      //字符串转成JSON
                      var PI = JSON.parse(res.data.trim())
                      // success
                      console.log(PI)
                      that.globalData.PI = PI

                      console.log('djn', PI)
                      console.log('nickName', PI.nickName)
                      //储存到缓存
                      wx.setStorage({
                        key: "PI",
                        data: PI,
                        success: register(that, PI),

                      })
                      //存储到全局变量
                    },
                    fail: function (res) {
                      wx.showModal({
                        title: '提示',
                        content: '获取个人信息失败',
                      })
                      console.log(res)
                    }
                  })

                },
                fail: function (res) {
                  console.log('res', res)
                  if (wx.openBluetoothAdapter) {
                    wx.hideToast()
                  }
                  wx.showModal({
                    title: '提示',
                    content: '您曾经拒绝过小程序授权，我不能再调用授权弹窗，请去小程序列表删除小程序再扫码或者点击进入小程序。请谅解！',
                  })
                }
              })
            }
          },
          fail: function () {
            // fail
          }
        })
      }
    },
    fail: function (res) {
      // fail
      console.log(res)
    }
  })
}


/*获取用户信息或者注册*/
function register(that, PI) {
  console.log("unionId", PI.nickName)
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/wechat_login',
    data: {
      unionid: PI.unionId,
      name: PI.nickName,
      sex: (PI.gender) - 1,
      open_id: PI.openId,
      avatar: PI.avatarUrl
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("获取电话号码", res)
      var tel1 = res.data.data.tel
      PI["uid"] = res.data.data.uid
      PI["id"] = res.data.data.id
      that.globalData.PI = PI
      console.log("uid", PI.uid)
      wx.setStorage({
        key: 'PI',
        data: PI,
      })
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '注册/登录失败',
        success: function (res) {
          if (res.confirm) {
            login(that)
          }
        }
      })
    },

  })
}



