// pages/milaic/notice/notice.js
var that
Page({
  data: {
    list: [],
  },
  onLoad: function (options) {
    that = this
    notice()
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },

})
function notice() {
  wx.request({
    url: 'https://a.milaipay.com/mspt/Applet/pushInfo',
    data: {},
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      console.log(res.data.data)
      for (var i = 0; i < res.data.data.length; i++) {
        res.data.data[i].time = time(res.data.data[i].time)
      };
      that.setData({
        list: res.data.data
      })
      wx.setStorage({
        key: "notice_id",
        data: res.data.data[(res.data.data.length) - 1].id
      })
      // success
    },
    fail: function () {
      // fail
    },
    complete: function () {
      // complete
    }
  })
}
function time(time) {
  var date = new Date(time * 1000);
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  return (M + "/" + D);
}