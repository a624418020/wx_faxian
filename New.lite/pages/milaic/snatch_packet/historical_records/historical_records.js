// pages/milaic/snatch_packet/historical_records/historical_records.js
const app = getApp();
var PI = {}, touch_o = true;
const ISSUE = 1;//我发出的
const RECEIVE = 2;//我接收到的
Page({

  /**
   * 页面的初始数据
   */
  data: {
    issue_style: 'color: rgb(216, 89, 64);border-bottom: 5rpx solid rgb(216, 89, 64);',
    receive_style: ''//选择框的颜色
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    PI = app.globalData.PI
    if (PI == null || PI == undefined || PI == '') {
      wx.redirectTo({
        url: 'pages/milaic/snatch_packet/generate_money/generate_money'
      })
    }
    this.setData({
      head_logo: PI.avatarUrl,
      nickname: PI.nickName,
    })
    getList(this, ISSUE);
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
  //我发出
  issue: function (e) {
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
      this.setData({
        issue_style: 'color: rgb(216, 89, 64);border-bottom: 5rpx solid rgb(216, 89, 64);',
        receive_style: ''
      })
      getList(this, ISSUE);
      console.log(e)
    }
  },
  //我收到
  receive: function (e) {
    if (touch_o) {
      touch_o = false
      setTimeout(function () {
        touch_o = true
      }, 1000)
      this.setData({
        issue_style: '',
        receive_style: 'color: rgb(216, 89, 64);border-bottom: 5rpx solid rgb(216, 89, 64);'
      })
      getList(this, RECEIVE);
      console.log(e)
    }
  },
  //点击
  click: function (e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/milaic/snatch_packet/pay_money/pay_money?packet_id=' + e.currentTarget.dataset.id
    })
  }
})
//获取数据列表
function getList(that, mytype) {
  wx.request({
    url: "https://fangche.domobile.net/Api/Redball/getList",
    data: {
      type: mytype,
      open_id: PI.openId,
      page: '1'
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      //如果接口不是200那么就弹窗提示，
      if (mistaken(res)) {
        return
      }
      that.setData({
        user_list: setdate(res.data.result.user_list),
        user_sum: res.data.result.user_sum

      })
      console.log('获取数据列表', res)
    },
    fail: function (e) {
      timeout()//超时
    },
  })
}
//网络错误连接提示
function timeout() {
  wx.hideLoading()//取消Loading
  wx.showModal({
    title: '提示',
    content: '网络异常',
  })
}
//接口回调不是200
function mistaken(res) {
  if (res.statusCode != 200) {
    wx.showToast({
      title: res.errMsg,
      image: '/images/false.png',
      duration: 2000
    })

    return true
  } else {
    if (res.data.code != 200) {
      wx.showToast({
        title: res.data.msg,
        image: '/images/false.png',
        duration: 2000
      })
      return true
    }
  }
}
//循环拿到时间
function setdate(data) {
  for (var key in data) {
    data[key].create_time = formatDate(data[key].create_time)
  }
  return data
}
//时间转换
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