// pages/milaic/join/join.js
/*0 审核中
1通过
2未通过 */
var PI={}
var app=getApp()
var appid = 'wxa9f5672aa584035c'
var secret = '784f07488fe02e84300f570bb6cd695e'
var form
var that
var visible//taost是否可见
var txt1 = "我叫郭晓明，我的梦想是成为一名作家。我十分爱好读书与写作，自认为有较深厚的文字功底。业余时间我也会向杂志社和文学网站投稿，偶有收到稿费作为肯定。除了写作，我还是一名摄影爱好者，虽然还在不断摸索进步的过程中，但是作品经常能得到周围人的称赞。我偶然得知『发现』平台后，我觉得它是一个可以让我实现梦想的地方，所以我申请成为发现家，希望能让更多的人看到我的文学和摄影作品。"
var t1 //定时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    form:{},
    txt1: txt1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '您当前微信版本过低，可能有些功能无法正常运行'
      })
    }
    that = this
    PI = app.globalData.PI
    //判断有没有uid,有就是已经登陆过
    if (PI.uid == null || PI.uid == undefined || PI.uid == "") {
      dinshi(6,that)
    } else {
      is_join()
    }
    visible = true
  },
  formSubmit: function (e) {
    console.log('form发生了：', e.detail.value)
    form = e.detail.value;
    if (form.name == "" || form.tel == "" || form.textarea == "") {
      wx.showModal({
        title: '提示',
        content: '内容不可为空!',
        showCancel:false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    }else{
      subfrom(form);
    }
  },
  button_quit:function(){
    wx.navigateBack({
     delta: 1
      })
  },
  button_modify:function(){
    visible=false
    that.setData({
      visible: visible
    })
  },

  onHide: function () {
    clearInterval(t1);
  },
  onUnload: function () {
    clearInterval(t1);
  },
  //   /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }


})

function subfrom(form){
  console.log('用户点击确定', PI.uid,form.address, form.summary)
  if (wx.openBluetoothAdapter) {
    wx.reportAnalytics('join', {
      y_uid: PI.uid,
      y_name: PI.nickName,
      n_name: form.name,
      n_tel: form.tel,
      n_add: form.address,
      n_summary: form.summary,
      type: '2',
    });
  }

  wx.request({
    url: 'https://a.milaipay.com/mspt/Applet/faXianJia',
    data: {
      type:"2",//2是成为发现家
      name: form.name,
      tel: form.tel,
      uid: PI.uid,
      address: form.address,
      summary: form.summary,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("add_like", res)
      if (res.data.status == "1") {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000
        })
        //将用户填写的内容存储到本地
       wx.setStorageSync('form', form)
       var t1 = setTimeout(function(){
         clearInterval(t1);
          wx.navigateBack({
            delta: 1
          })
        } , 1500)

      } else {
        return false
      }
    }
  })
}

function is_join() {
  console.log('用户点击确定', PI.uid, )
  wx.request({
    url: 'https://a.milaipay.com/mspt/Applet/findFaxian',
    data: {
      type: "2",//2是成为发现家
      uid: PI.uid,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("add_like", res)
      if (res.data.status == "1") {
        console.log("成功")
        // wx.showModal({
        //   title: '审核中...',
        //   content: '您提交的内容已进入后台审核中。',
        //   confirmText: "我要修改",
        //   success: function (res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       wx.navigateBack({
        //         delta: 1
        //       })
        //     }
        //   }
        // })
        that.setData({
          visible: visible,
          form: res.data.data
        })
      } else {
        return false
      }
    }
  })
}

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
      PI["id"] = res.data.data.id
      app.globalData.PI = PI
      console.log("uid", PI.uid)
      wx.setStorage({
        key: 'PI',
        data: PI,
      })
      //获取到UID后再执行页面初始化内容

      //判断是否已有手机号码
      if (tel1 != null && tel1 != undefined && tel1 != "undefined" && tel1 != "") {
        app.globalData.tel = tel1
        wx.setStorage({
          key: 'tel',
          data: tel1,
        })
      }
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '注册/登录失败',
      })
    },

  })
}

//等待APP.JS获取到UID
function dinshi(that, num) {
  var name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      //获取到后执行的操作
      is_join()

      //获取到后执行的操作
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
