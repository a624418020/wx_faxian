// pages/topic/activity1/activity_list1.js
// status=3 返回所有数据
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
    var that = this;
    votedata(that)

  },
  //动态设置广告宽度
  imageLoad: function (e) {

    var  originalWidth = e.detail.width;
    var  originalHeight = e.detail.height;
    var imageWidth={}
    var id = e.currentTarget.id
    imageWidth = {id:(originalWidth / originalHeight) * 36} 
    console.log("imageWidth", imageWidth)
    this.setData({
      imageWidth: imageWidth
    })
  },
  bt_topic: function (e) {
    wx.navigateTo({
      url: '../vote/vote?id=' + e.currentTarget.dataset.id + "&groups="+e.currentTarget.dataset.index
    })
    console.log("bt", e)
  }

})

//活动列表
// status=3 返回所有数据//正常状态没有status
function votedata(that) {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/getAllactivityByGroups',
    data: {
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("votedata", res)
      if (res.data.status == 1) {
        // var a={}
        // for (key in res.data.data) {
        //  switch(key){
        //    case 1:
        //      a.key = logo1; break;
        //    case 2:
        //      a.key = logo2; break;
              
        //  }
         
        // }
        
        for (var key in res.data.data){
          res.data.data[key].sort(keysrt('id', true))
          // console.log("aaaaa", res.data.data[key].sort(keysrt('id', true)))
          console.log("bbbbb",  key)
        }
        // console.log("votedata", res.data.data)
        // console.log("votedata", res.data.data.sort(keysrt('id', true)))

        // ary.sort(keysrt('name', false));
        // ary.sort(keysrt('id', false));
        that.setData({
          list: res.data.data,
        })

        console.log("votedata", res.data.data)
      }

    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取列表失败',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  })
}
function keysrt(key, desc) {
  return function (a, b) {
    return desc ? (parseInt(a[key]) < parseInt(b[key])) : (parseInt(a[key]) > parseInt(b[key]) );
  }
}