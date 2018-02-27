// pages/milaic/snatch_packet/password_list/password_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chosen: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    password_list(this);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  //栏目
  section: function (e) {
    this.setData({
      chosen: e.target.dataset.id,
    })
  },
  //选择的口令的ID
  password_id: function (e) {
    wx.navigateBack({
      delta: 1
    })
    app.globalData.snatch_packet_id = e.target.dataset
    console.log(e.target.dataset)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

})
function password_list(that) {
  wx.request({
    url: 'https://fangche.domobile.net/Api/Redball/getOptionList',
    data: {
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      //如果接口不是200那么就弹窗提示，
      var password_list = [], password_left = [], password_right = []
      if (mistaken(res)) {
        return
      }
      for (var key in res.data.result) {
        if (res.data.result[key].pid == 0) {
          password_left.push(res.data.result[key])
        } else {
          password_right.push(res.data.result[key])
        }
      }
      password_list[0] = password_left.reverse();
      password_list[1] = password_right;
      that.setData({
        password_list: password_list,
      })
      console.log('res1111', password_list)
    },
    fail: function (res) {
      console.log("获取数据失败", res)
      wx.showModal({
        title: '提示',
        content: '获取数据失败',
      })
    },
    complete: function (res) {
    }
  })
}
//接口回调不是200
function mistaken(res) {
  console.log('所有回调', res)
  try {
    if (res.statusCode != 200) {
      wx.showToast({
        title: res.errMsg,
        image: '/images/false.png',
        duration: 2000
      })
      return true
    }
    if (res.data.code != 200) {
      wx.showToast({
        title: res.data.msg,
        image: '/images/false.png',
        duration: 2000
      })
      return true
    }
    if (res.data.code == 200) {
      return false
    }
    console.log('接口回调判别方法', res)
    wx.showToast({
      title: '接口回调失败',
      image: '/images/false.png',
      duration: 2000
    })
    return true
  } catch (e) {
    console.log('接口回调判别方法', res)
    wx.showToast({
      title: '接口回调失败',
      image: '/images/false.png',
      duration: 2000
    })
    return true
  }
}