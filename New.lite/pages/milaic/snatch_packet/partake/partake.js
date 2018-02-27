// pages/milaic/snatch_packet/partake/partake.js
// pages/partake/partake.js
var app = getApp();
var windowHeight, windowWidth, ratio_Height = 1, ratio_Width = 1, PI, image
var packet_id, packet_text//分享的红包ID
var logo = 'https://wx.qlogo.cn/mmopen/vi_32/ToicT5W4iaz6VQMOM31ARJJwytag5MrWTokAnduAFziauK1gFxldZQkpKeNDJIr1RyVCRicjZNzMuPyibiaVxefxNvLQ/0'
const ctx = wx.createCanvasContext('myCanvas')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    FriendsCircle: false,
    image: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    authorize();
    PI = app.globalData.PI
    logo = PI.avatarUrl
    this.setData({
      logo: PI.avatarUrl
    })
    console.log('options', options);
    if (options != '' && options != null && options != undefined){
      this.setData({
        password: options.password_text
      })
      packet_text = options.password_text
      packet_id = options.packet_id
    }else{
      //没有获取到口令不能分享
      wx.showToast({
        title: '没有获取到口令',
        image: '/images/false.png',
        duration: 2000
      })
    }
    rpx_px();//获取手机屏幕可用宽高
    gettoken(this)//获取二维码
    let suning_size = 90 * ratio_Height
    let QR_size = 126 * ratio_Height
    let pic_white = 150 * ratio_Height
    let iconZhiwen_size = 202 * ratio_Height
    ctx.drawImage('/images/pic_bag.png', 0, 0, windowWidth, windowHeight)
    ctx.drawImage('/images/pic_white.png', windowWidth / 2 - (pic_white / 2), windowHeight / 2 - (pic_white / 2), pic_white, pic_white)
    ctx.setFontSize(17)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#FFE5B5')
    ctx.fillText('发了一个语音口令红包', windowWidth / 2, 150 * ratio_Height)
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#ECCF9B')
    ctx.fillText(packet_text, windowWidth / 2, 200 * ratio_Height)
  },
  onShareAppMessage: function () {
    return {
      title: '发现一个大红包',
      path: 'pages/milaic/snatch_packet/pay_money/pay_money?packet_id=' + packet_id
    }
  },
  //返回首页
  return_bt: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  //生成图片
  FriendsCircle: function () {
    if (ratio_Height == -1 || ratio_Width == -1) {
      wx.showToast({
        title: '画板打开失败，请重新打开小程序',
        image: '/images/false.png',
        duration: 2000
      })
    } else {
      this.setData({
        FriendsCircle: true
      })
      wx.showLoading({
        title: '加载中',
      })
      let that = this
      setTimeout(function () {
        wx.hideLoading()
        generate(that)
      }, 2000)
    }
  }

})

//获取二维码图片
function gettoken(that) {
  console.log('open_id', PI.openId)
  console.log('data', packet_id,)
  wx.request({
    url: "https://fangche.domobile.net/Api/Index/sc_ew",
    data: {
      data: packet_id,
      page: "pages/milaic/snatch_packet/pay_money/pay_money",
      open_id: PI.openId
    },
    header: {
      'content-type': 'application/json'// 默认值
    },
    success: function (res) {
      let url = 'https://' + res.data.result
      console.log('url', url)
      if (mistaken(res)) {
        return
      }
      wx.downloadFile({
        url: url,
        success: function (res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          console.log('image111res', res)
          wx.hideLoading()//取消Loading
           image = res.tempFilePath;
          let QR_size = 126 * ratio_Height
          let loge = 45 * ratio_Height
          /**画二维码 */
          ctx.drawImage(image, windowWidth / 2 - (QR_size / 2), windowHeight / 2 - (QR_size / 2), QR_size, QR_size);
          ctx.restore();
         /**画头像 */
          circleImg(ctx, image, windowWidth / 2 - loge, 20 * ratio_Height, loge);
          that.setData({ image: image });
        },
        fail: function (res) {
          console.log('fail', res)
          wx.showToast({
            title: '图片下载错误',
            image: '/images/false.png',
            duration: 2000
          })
          wx.hideLoading()//取消Loading
        }
      })
    },
    fail: function (e) {

      timeout()//超时
    },
  })

}

function rpx_px() {
  try {
    var res = wx.getSystemInfoSync()
    console.log("id1", res)
    windowHeight = res.windowHeight;
    windowWidth = res.windowWidth;
    ratio_Height = windowHeight / 603;
    ratio_Width = windowWidth / 375;
  } catch (e) {
    ratio_Height = -1
    ratio_Width = -1
    // Do something when catch error
  }
}
//网络错误连接提示
function timeout() {
  wx.hideLoading()//取消Loading
  wx.showModal({
    title: '提示',
    content: '网络异常',
  })
}
function generate(that) {
  var tempFilePaths
  wx.canvasToTempFilePath({
    canvasId: 'myCanvas',
    success: function (res) {
      console.log(res.tempFilePath)
      tempFilePaths = res.tempFilePath
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePaths,
        success(res) {
          wx.showModal({
            title: '提示',
            content: '图片已保存到相册 快去打开微信朋友圈分享图片哦!',
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          // setTimeout(function () {
          //   that.setData({
          //     visible:true,
          //     FriendsCircle: false,
          //   })

          // }, 2000)
        },
        fail(res) {
          console.log("下载错误", res)
          wx.showModal({
            title: '提示',
            content: '图片下载错误:查看您的微信是否获得相册权限',
          })
        }
      })
    },
    fail: function (res) {
      console.log("下载错误", res)
      wx.showModal({
        title: '提示',
        content: '因官方原因导致在苹果微信6.5.22版本上不可保存到相册',
      })
      console.log("image2", res)
    }
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
//保存图片授权
function authorize() {
  console.log('调用授权')
  wx.authorize({
    scope: 'scope.writePhotosAlbum',
    success() {
      console.log('同意授权')
      // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    }
  })
}

function circleImg(ctx, img, x, y, r) {
  wx.downloadFile({
    url: 'https://wx.qlogo.cn/mmopen/vi_32/ToicT5W4iaz6VQMOM31ARJJwytag5MrWTokAnduAFziauK1gFxldZQkpKeNDJIr1RyVCRicjZNzMuPyibiaVxefxNvLQ/0',
    success: function (res) {
      ctx.save();
      var d = 2 * r;
      var cx = x + r;
      var cy = y + r;
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(res.tempFilePath, x, y, d, d);
      ctx.restore();
      ctx.draw()
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '头像下载错误',
      })
      console.log("image2", res)
    }
  })
}


