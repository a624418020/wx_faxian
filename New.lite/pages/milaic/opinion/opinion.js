// pages/milaic/opinion/opinion.js
var PI = {}
var app = getApp()
var t1 //定时器
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    PI = app.globalData.PI
  },
  formSubmit: function (e) {
    console.log('form发生了：', e.detail.value)
    var form = e.detail.value;
    if (form.content == "" || form.tel == "" ) {
      wx.showModal({
        title: '提示',
        content: '内容不可为空!',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    } else {
      if (wx.openBluetoothAdapter) {
        wx.reportAnalytics('feedback', {
          y_name: PI.nickName,
          y_uid: PI.uid,
          y_problem: form.tel,
          y_contact: form.content,
        });
      }
      if (form.tel =='20110601'){
          wx.showToast({
            title: '开启开发者',
            icon: 'success',
            duration: 2000
          })
          // 打开调试
          wx.setEnableDebug({
            enableDebug: true
          })
          wx.setStorage({
            key: 'developer',
            data: 1,
          })
          return
      }
      subfrom(form);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
    onHide: function () {
      clearInterval(t1); 
  },
  onUnload: function () {
    clearInterval(t1); 
  },


})

function subfrom(form) {
  console.log('用户点击确定', form.tel, form.content)

  wx.request({
    url: 'https://a.milaipay.com/Mspt/Applet/opinion',
    data: {
      type: "1",//1是小程序
      contact: form.tel,
      uid: PI.uid,
      content: form.content,
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
        var t1 = setTimeout(function () {
          clearInterval(t1);
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      } else {
        return false
      }
    }
  })
}