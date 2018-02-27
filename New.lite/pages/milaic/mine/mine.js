// pages/milaic/mine/mine.js
var appid = 'wxa9f5672aa584035c'
var secret = '784f07488fe02e84300f570bb6cd695e'
var UID = require("../../../utils/uid.js");
var that, tel, join, Onlyone = true
var PI = {};
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: "",
    nickName: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    join = options.join
    that = this;
    PI = app.globalData.PI
    //判断有没有uid,有就是已经登陆过
    if (PI.uid == null || PI.uid == undefined || PI.uid == "") {
      dinshi(that,6)
      // login(that)
    } else {

      that.setData({
        avatarUrl: PI.avatarUrl,
        nickName: PI.nickName,
      })
      console.log("aaa", options.join)
      if (join == 1) {
        wx.navigateTo({
          url: '../../milaic/join/join'
        })
      }
    }
  },
  //点击头像会更新头像和名称
  setavatarUrl: function (e) {
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        PI.nickName = userInfo.nickName
        PI.avatarUrl = userInfo.avatarUrl
        console.log("aaa", userInfo.avatarUrl)
        that.setData({
          avatarUrl: PI.avatarUrl,
          nickName: PI.nickName,
        })
      }
    })
  },
  button: function (e) {
    if (Onlyone){
      Onlyone=false
      var a = e.currentTarget.id;
      // console.log("aaa", a)
      switch (a) {
        case "join":
          wx.navigateTo({
            url: '../../milaic/join/join'
          })

          break;
        case "wantjoin":
          wx.navigateTo({
            url: '../../milaic/wantjoin/wantjoin'
          })

          break;
        case "collection":
          wx.navigateTo({
            url: '../../milaic/articlecoll/articlecoll'
          })
          break;
        case "network":
          wx.navigateTo({
            url: '../../milaic/notice/notice'
          })
          break;
        case "return":
          if (wx.reLaunch) {
            wx.reLaunch({
              url: '../../new/list/new'
            })
          } else {
            wx.switchTab({
              url: '../../new/list/new'
            })
          }
          break;
        case "opinion":
          wx.navigateTo({
            url: '../../milaic/opinion/opinion'
          })
          break;
      }

      setTimeout(function () {
        Onlyone = true
      }, 2000)
    }
 
  },
})

//等待APP.JS获取到UID
function dinshi(that, num) {
  var name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      //获取到后执行的操作

      that.setData({
        avatarUrl: PI.avatarUrl,
        nickName: PI.nickName,
      })
      console.log("aaa", options.join)
      if (join == 1) {
        wx.navigateTo({
          url: '../../milaic/join/join'
        })
      }

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
