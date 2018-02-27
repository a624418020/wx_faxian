var appid = 'wxa9f5672aa584035c'
var secret = '784f07488fe02e84300f570bb6cd695e'
var that, tel
var PI = {};
var app = getApp();

//登录获取unionId
function login(that) {
  wx.login({
    success: function (res) {
      // success
      if (res.code) {
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code',
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
                      PI = JSON.parse(res.data.trim())
                      // success
                      console.log(PI)
                      that.setData({
                        avatarUrl: PI.avatarUrl,
                        nickName: PI.nickName,
                      })
                      app.globalData.PI = PI

                      console.log('djn', PI)
                      console.log('nickName', PI.nickName)

                      //储存到缓存
                      wx.setStorage({
                        key: "PI",
                        data: PI,
                        success: register(),

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
function register() {
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
      app.globalData.PI = PI
      console.log("uid", PI.uid)
      wx.setStorage({
        key: 'PI',
        data: PI,
      })
      //判断是否已有手机号码
      if (tel1 != null && tel1 != undefined && tel1 != "undefined" && tel1 != "") {
        app.globalData.tel = tel1
        wx.setStorage({
          key: 'tel',
          data: tel1,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '为提供更便捷服务，请绑定手机',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../../milaic/binding/binding'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })

      }


      //    card_data(),
      //     first(),

      // wx.navigateBack({
      //   delta: 1
      // })
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '注册/登录失败',
      })
    },

  })
}
