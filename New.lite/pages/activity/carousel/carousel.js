// pages/activity/carousel/carousel.js
var image = [], distance_x, down_x = -1, ratio_w
var lock = true//防止重复触发
Page({

  /**
   * 页面的初始数据
   */
  data: {
    image: '',
    hidden: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getSystemInfoSync()
    var animation1 = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    })
    var animation2 = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    })
    var animation3 = wx.createAnimation({
      duration: 400,
      timingFunction: "linear",
      delay: 0
    })
    this.animation1 = animation1
    this.animation2 = animation2
    this.animation3 = animation3
    image.push("http://b.milaipay.com/Public/img/5a6e74a9ab6f5.jpg")
    image.push("http://b.milaipay.com/Public/img/5a40cf9e429ba.jpg")
    image.push(" http://b.milaipay.com/Public/img/5a40bcfa363e1.png")
    image.push("http://b.milaipay.com/Public/img/59e983d52cfa1.png")
    image.push("http://b.milaipay.com/Public/img/5a3dee33ee70f.png")
    image.push("http://b.milaipay.com/Public/img/5a41c636be8a5.jpg")
    this.setData({
      image: image
    })

  },
  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {
    var that = this
    setTimeout(function () {
      that.animation1.translateX(-255 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
      that.animation2.translateX(-240 * ratio_w).scale(1, 1).step({ duration: 0 })
      that.animation3.translateX(-225 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
      that.setData({
        animationData1: that.animation1.export(),
        animationData2: that.animation2.export(),
        animationData3: that.animation3.export(),
      })
      console.log("向左滑动", );
    }, 50)
  },
  //触摸开始事件
  touchstart: function (e) {
    if (lock) {
      lock = false
      console.log('开始滑动', e);
      down_x = e.changedTouches[0].pageX
      setTimeout(function () {
        lock = true
      }, 2000)
    }

  },
  //触摸结束事件
  touchend: function (e) {
    if (down_x > 0) {
      console.log('结束滑动', e);
      const that = this
      distance_x = e.changedTouches[0].pageX - down_x;
      if (distance_x < -40 * ratio_w) {
        scrollleft(that)
      } else if (distance_x > 40 * ratio_w) {
        scrollright(that)
      } else {
        lock = true
      }
      console.log('滑动距离', distance_x);
    }
  }

})
//左滑动画or右滑动direction 左边1右边-1
function scrollleft(that) {
  image.push(image.shift())
  that.animation1.translateX(-500 * ratio_w).scale(0.9, 0.9).step()
  that.animation2.translateX(-500 * ratio_w).scale(0.9, 0.9).step()
  that.animation3.translateX(-500 * ratio_w).scale(1, 1).step()
  console.log("向左滑动", );
  that.setData({
    hidden1: 1,
    hidden: 0,
    animationData1: that.animation1.export(),
    animationData2: that.animation2.export(),
    animationData3: that.animation3.export(),
  })
  setTimeout(function () {

    that.animation1.translateX(-255 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
    that.animation2.translateX(-240 * ratio_w).scale(1, 1).step({ duration: 0 })
    that.animation3.translateX(-225 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
    that.setData({
      image: image,//动画图片变动

      animationData1: that.animation1.export(),
      animationData2: that.animation2.export(),
      animationData3: that.animation3.export(),
    })
    console.log("向左滑动");
    lock = true
  }, 400)

  setTimeout(function () {
    that.setData({
      hidden: 1,//执行
      main_image: image
    })
  }, 396)


}
//右滑动画
function scrollright(that) {
  image.unshift(image.pop())
  that.animation1.translateX(45 * ratio_w).scale(1, 1).step()
  that.animation2.translateX(45 * ratio_w).scale(0.9, 0.9).step()
  that.animation3.translateX(45 * ratio_w).scale(0.9, 0.9).step()
  console.log("向左滑动", );
  that.setData({
    hidden: 0 ,
    animationData1: that.animation1.export(),
    animationData2: that.animation2.export(),
    animationData3: that.animation3.export(),
  })
  setTimeout(function () {
    that.animation1.translateX(-255 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
    that.animation2.translateX(-240 * ratio_w).scale(1, 1).step({ duration: 0 })
    that.animation3.translateX(-225 * ratio_w).scale(0.9, 0.9).step({ duration: 0 })
    that.setData({
      image: image,//动画图片变动
      animationData1: that.animation1.export(),
      animationData2: that.animation2.export(),
      animationData3: that.animation3.export(),
    })
    lock = true
    console.log("向左滑动", );
  }, 400)
  setTimeout(function () {
    that.setData({
      hidden: 1,//执行
      main_image:image
    })
  },396)

}
//同步获取系统宽高
function getSystemInfoSync() {
  try {
    var res = wx.getSystemInfoSync()
    console.log(res.screenWidth)
    console.log(res.screenHeight)
    console.log(res.windowWidth)
    console.log(res.windowHeight)
    console.log(res.pixelRatio)
    ratio_w = res.screenWidth / 350;
  } catch (e) {
    //获取系统信息失败
  }
}