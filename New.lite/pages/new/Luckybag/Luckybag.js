// pages/new/Luckybag/Luckybag.js
var app = getApp()
var PI
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
    wx.showLoading({
      title: '加密中',
    })
    PI = app.globalData.PI
      //有效值 develop（开发版），trial（体验版），release（正式版） ，
      wx.navigateToMiniProgram({
        appId: 'wxdc2adb82f153402b',
        path: 'milai/milaipay/milaipay?activityid=' + options.activityID + '&nickname=' + PI.nickName + '&uid=' + PI.uid,
        envVersion: 'trial',
        extraData: {
          activityid: options.activityID,
          nickname: PI.nickName,
          uid: PI.uid
        },
        success(res) {
          app.globalData.activityID = -1
          console.log("打开成功")
          // 打开成功
        },
        complete() {
          wx.hideLoading()
        }
      })

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.success){
      app.globalData.success=false
      wx.navigateBack({
        delta: 1
      })
    }
   
  },










})