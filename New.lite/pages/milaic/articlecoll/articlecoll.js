// pages/milaic/articlecoll/articlecoll.js
var PI = {};
var that, dellike = true
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: {}//数据列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    PI = app.globalData.PI
    that = this
    getlist()
  },
  del: function (e) {
    console.log('list', e)
    var index = e.currentTarget.dataset.name
    if (dellike) {
      wx.showModal({
        title: '提示',
        content: '您确定准备取消收藏？',
        success: function (res) {
          if (res.confirm) {
            dellike = false
            del_like(e.currentTarget.id, index)
          } else if (res.cancel) {
            return
          }
        }
      })
    } else {
      del_like(e.currentTarget.id, index)
    }


  },
  list: function (e) {
    console.log('list', e)
    wx.navigateTo({
      url: '../../new/news/article?id=' + e.currentTarget.id
    })
  }

})
//获取收藏列表
function getlist() {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/getUserCollectionList',
    data: {
      uid: PI.uid,
    },
    method: 'POST',
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log('收藏列表', res.data)
      if (res.data.status == "1") {
        that.setData({
          list: res.data.data
        })
        console.log('收藏列表1', res.data.data)
      } else {
        wx.showModal({
          title: '错误提示',
          content: res.data.msg,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }



    },
    fail: function (res) {
      wx.showModal({
        title: '错误提示',
        content: "网络错误，请稍后再试",
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      // fail
    },
    complete: function (res) {
      // complete
    }
  })
}

//取消收藏
function del_like(id, index) {
  console.log("del_like", )
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/deleteCollection',
    data: {
      activityid: id,
      uid: PI.uid,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("del_like", res)
      if (res.data.status == "1") {
        wx.showToast({
          title: '取消成功',
          icon: 'success',
          duration: 2000
        })
        var listdata = that.data.list
        //删除对象
        listdata.splice([index], 1)
        that.setData({
          list: listdata
        })
      } else {
        return false
      }
    }
  })
}