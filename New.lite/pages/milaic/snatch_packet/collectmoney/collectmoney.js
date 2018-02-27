// pages/milaic/snatch_packet/collectmoney/collectmoney.js
var name, t_number, is_debug = 0
var PI = {};
var touch//防止多次触摸点击
var totalAmount//总金额
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    PI: {},
    Amount: '0.00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      PI = wx.getStorageSync('PI')
      if (PI == null || PI == undefined || PI == "") {
        //如果没有就跳转首页
        wx.redirectTo({
          url: 'pages/milaic/snatch_packet/generate_money/generate_money'
        })
      }
    } catch (e) {
    }
    my_login(this)
    if (PI.t_number != null && PI.t_number != undefined && PI.t_number != ''){
      t_number=PI.t_number;
      name = PI.real_name;
      this.setData({
        PI:PI
      })
    }
    touch = true
    // is_debug = app.globalData.debug
    console.log('初始化改成true')
  },
  onReady: function () {
    if (app.globalData.debug == 1) {
      is_debug = 1;
    }
  },
  //input名字
  name: function (e) {
    console.log('name', e.detail.value)
    name = e.detail.value
  },
  //input电话号码
  t_number: function (e) {
    console.log('t_number', e.detail.value)
    t_number = e.detail.value
  },
  //提现按钮
  withdraw: function () {
    if (touch) {
      touch = false
      console.log('t_number是否可用', checkPhone(t_number))
      console.log('name', name)
      if (checkPhone(t_number) && name != undefined && name != null && name != '') {
        //如果信息没问题就保存缓存
        PI.t_number = t_number
        PI.real_name = name
        wx.setStorage({
          key: "PI",
          data: PI
        })
        //调用提现
        if (totalAmount>=1){
          submitted(this)
        }else{
          wx.showModal({
            title: '提示',
            content: '余额大于一元才可提现',
            success: function (res) {
            }
          })
        }
        
      } else {
        wx.showModal({
          title: '提示',
          content: '请检查您的姓名和手机号码是否有误或者为空',
          success: function (res) {
          }
        })
      }
    }
  }

})
//提交个人信息
function submitted(that) {
  console.log('name', name, 't_number', t_number, 'PI.open_id', PI.openId)
  wx.showLoading({
    title: '加载中',
  })
  wx.login({
    success: function (res) {
      wx.request({
        url: "https://fangche.domobile.net/Api/Redball/updateUserInfo",
        data: {
          real_name: name,
          tel: t_number,
          open_id: PI.openId,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideLoading()//取消Loading
          console.log('提交个人信息',res)
          if (mistaken(res)) {
            return
          }
          withdraw(that)
        },
        fail: function (e) {
          timeout()//超时
        },
      })
    }
  })
}
//提现
function withdraw(that) {
  console.log('PI.open_id', PI.openId)
  console.log('is_debug', is_debug)
  wx.showLoading({
    title: '加载中',
    mask: true,
  })
  wx.request({
    url: "https://fangche.domobile.net/Api/Redball/giveMoney",
    data: {
      open_id: PI.openId,
      is_debug: is_debug,
      money: 1
   //   money:totalAmount,
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      wx.hideLoading()//取消Loading
      console.log(res.data.code)
      console.log('提现',res)
      if (res.statusCode != 200) {
        wx.showToast({
          title: res.errMsg,
          image: '/images/false.png',
          duration: 2000
        })
        touch = true
        console.log('withdraw的res.statusCode != 200)改的')
      } else {
        if (res.data.result == null || res.data.result == undefined || res.data.result == '') {
          wx.showToast({
            title: res.data.msg,
            image: '/images/false.png',
            duration: 2000
          })
          touch = true
          console.log('withdraw的res.data.result == null改的')
        } else if (res.data.code != 200 && res.data.result.err_code_des == '余额不足') {
          wx.showModal({
            title: '提示',
            content: '今日系统提现金额已达上限，请明日早早提现哦~',
          })
          console.log('withdraw的res.data.code != 200 && res.data.result.err_code_des == 余额不足改的')
          touch = true
        } else if (res.data.code != 200) {
          wx.showToast({
            title: res.data.result.err_code_des,
            image: '/images/false.png',
            duration: 2000
          })
          touch = true
          console.log('withdraw的res.data.code != 200改的')
        } else if (res.data.code == 200) {
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            Amount: '0.00',
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      }



    },
    fail: function (e) {
      wx.hideLoading()//取消Loading
      timeout()//超时
    },
  })
}
//网络错误连接提示
function timeout() {
  wx.hideLoading()//取消Loading
  wx.showModal({
    title: '提示',
    content: '网络连接失败',
  })
  touch = true
  console.log('timeout改成true')
}

//接口回调不是200
function mistaken(res) {
  if (res.statusCode != 200) {
    wx.showToast({
      title: res.errMsg,
      image: '/images/false.png',
      duration: 2000
    })
    touch = true
    console.log('mistaken的statusCode改成true')
    return true
  } else {
    if (res.data.code != 200) {
      wx.showToast({
        title: res.data.msg,
        image: '/images/false.png',
        duration: 2000
      })
      touch = true
      console.log('mistaken的code改成true')
      return true
    } else {
      return false
    }
  }
}
function checkPhone(phone) {
  console.log('phone', phone)
  if (!(/^1[3456789]\d{9}$/.test(phone))) {

    return false;
  } else { return true; }
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
          totalAmount = res.data.result.total_money//总金额
          that.setData({
            Amount: totalAmount
          })
          console.log('注册', res)
        },
        fail: function (e) {
          timeout()//超时
        },
      })
    }
  })
}