// pages/new/share/share.js
var tempFilePaths, timedata = 3, intervarID, width01, height01
var app = getApp()
var id, PI, title
Page({

  /**
   * 页面的初始数据
   */
  data: {
    button: false,
    image:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var delta_1=false
    if (wx.getSetting) {
      wx.getSetting()
    } else {
      delta_1=true
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        success: function (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            })
          }

        }

      })
    }
    rpx_px(this)
    console.log("options", options)
    PI = app.globalData.PI
    id = options.id
    title = options.title
    console.log("title", title)
    setqr(id, this)
    // if (PI.id == null || PI.id ==undefined){
    //   register(id, this)
    // }
    //如果判断微信版本过低就直接返回到上一页
    if (delta_1){
      wx.navigateBack({
        delta: 1
      })
    }
  },

  button: function () {
    var that = this
    var tempFilePaths
    wx.reportAnalytics('qr_code', {
      uid: PI.uid,
      u_name: PI.nickName,
      title: title,
      title_id: id,
    });
    wx.canvasToTempFilePath({
      width: 375 * width01,
      height: 562 * height01,
      canvasId: 'myCanvas',
      success: function (res) {
        console.log(res.tempFilePath)
        tempFilePaths = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePaths,
          success(res) {
            that.setData({
              visible: true,
              image: tempFilePaths
            })
          },
          fail(res) {
            wx.showModal({
              title: '提示',
              content: '图片下载错误:查看您的微信是否获得相册权限',
            })
          }
        })
      },
      fail: function (res){
        wx.showModal({
          title: '提示',
          content: '因官方原因导致在苹果微信6.5.22版本上不可保存到相册',
        })
        console.log("image2", res)
      }
    })


  },
  visible: function () {
    this.setData({
      visible: false
    })
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(intervarID)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(intervarID)
  },

})

function getimage(that, ctx) {
  wx.hideLoading()
  // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            // 用户已经同意小程序使用保存到相册功能，后续调用 wx.startRecord 接口不会弹窗询问
            wx.saveImageToPhotosAlbum()
            wx.saveVideoToPhotosAlbum()
          }
        })
      }
    }
  })
  var data = "https://a.milaipay.com/Public/shares/" + id + ".png"
  // var data = "https://a.milaipay.com/Public/rice/" + id + ".png"
  console.log("id", data)
  //下载到本地
  wx.downloadFile({
    url: data,
    success: function (res) {
      console.log("image", res)
      if (res.statusCode == 200) {
        tempFilePaths = res.tempFilePath
        console.log("width01", width01)
        console.log("height01", height01)
        ctx.drawImage(
          tempFilePaths, 0, 0, 375 * width01, (562 * height01)-1
        )
        console.log("图片宽", 375 * width01)
        console.log("图片高", 562 * height01)
        if (PI.nickName == null || PI.nickName ==undefined){
          wx.showModal({
            title: '提示',
            content: '应为未知原因，系统没有获取到您的昵称',
            success: function (res) {
              if (res.confirm) {
                var nickName="游客"
              } else if (res.cancel) {
                var nickName = "游客"
              }
            }
          })
        }else{
          var nickName = PI.nickName 
        }
        
        var name_le=0
        var le = unicode_len(nickName)
        var name = title.split("：")[0] 

        if (le>80){
          nickName = nickName.substring(0, 8)
          le = unicode_len(nickName )
          nickName = nickName+"..."
          name_le=14
        }
        
        if (unicode_len(name)>60||name == null || name==undefined){
          name="Ta"
          console.log("name", name)
        }

        console.log("第一步")
        ctx.setFillStyle('#FF6A00')
        ctx.setTextAlign('center')
        ctx.setFontSize(12)
        ctx.fillText(nickName, (50 * width01) + name_le / 2 + (le / 2), 548 * height01)


        console.log("第二步")
        ctx.setFillStyle('black')
        ctx.setTextAlign('left')
        ctx.setFontSize(12)
        ctx.fillText('正在阅读', (50 * width01) + name_le + le , 548 * height01)
       
        console.log("第三步")
        ctx.setFontSize(9)
        ctx.setFillStyle('black')
        ctx.setTextAlign('center')
        ctx.fillText('-长按识别发现'+name+'-', (294 * width01), 552 * height01)
        ctx.draw()
        // getimage1(that, ctx);
      } else {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '图片加载错误2',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
      }

    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '图片下载错误',
      })
    }
  })
}

// //可能会会出现图片下载错误，原因是因为二维码还未生成完成
// function getimage1(that, ctx) {

//   wx.hideLoading()
//   // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.record" 这个 scope
//   wx.getSetting({
//     success(res) {
//       if (!res.authSetting['scope.writePhotosAlbum']) {
//         wx.authorize({
//           scope: 'scope.writePhotosAlbum',
//           success() {
//             // 用户已经同意小程序使用保存到相册功能，后续调用 wx.startRecord 接口不会弹窗询问
//             wx.saveImageToPhotosAlbum()
//             wx.saveVideoToPhotosAlbum()
//           }
//         })
//       }
//     }
//   })
//   var data = "https://a.milaipay.com/Public/rice/" + id + "_erwei.png"
//   console.log("id", data)
//   //下载到本地
//   wx.downloadFile({
//     url: data,
//     success: function (res) {
//       console.log("image", res)
//       if (res.statusCode == 200) {
//         tempFilePaths = res.tempFilePath
//         console.log("width01", width01)
//         console.log("height01", height01)
//         ctx.drawImage(
//           tempFilePaths, 240 * width01, 413 * height01, 110 * width01, 110 * width01
//         )
//         ctx.draw()
//       } else {
//         wx.hideLoading()
//         wx.showModal({
//           title: '提示',
//           content: '图片加载错误1',
//           success: function (res) {
//             if (res.confirm) {
//               wx.navigateBack({
//                 delta: 1
//               })
//             }
//           }
//         })
//       }

//     },
//     fail: function (res) {
//       wx.showModal({
//         title: '提示',
//         content: '图片下载错误',
//       })
//     }
//   })
// }
//https://a.milaipay.com/Atm/Share/sc_img?
// var url = 'https://a.milaipay.com/Atm/Share/sc_test_img?id=' + id + '&uid=' + PI.uid
//注册图片
function setqr(id, that) {
  const ctx = wx.createCanvasContext('myCanvas')
  wx.showLoading({
    title: '加载中',
  })
  that.setData({
    button: true
  })
  var url = 'https://a.milaipay.com/Atm/Share/sc_img?id=' + id
  wx.request({
    url: url,
    data: {
    },
    method: 'get', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
      getimage(that, ctx)
    },
    fail: function (res) {
      console.log("id1", url)
    }
  })
}
//注册二维码
function setqr1(id, that) {
  const ctx = wx.createCanvasContext('myCanvas')
  wx.showLoading({
    title: '加载中',
  })
  that.setData({
    button: true
  })
  var url = 'https://a.milaipay.com/Atm/share/test_sc_erwei2?id=' + id + '&uid=' + PI.id
  wx.request({
    url: url,
    data: {
    },
    method: 'get', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
    },
    fail: function (res) {
      console.log("id1", url)
    }
  })
}


function rpx_px(that){
  try {
    var res = wx.getSystemInfoSync()
    width01 = res.windowWidth / 375
    height01 = (res.windowHeight-50)/562
//屏幕短的手机，为了比值不变，就要缩短宽
    if ((res.windowHeight-50)/res.windowWidth<1.40){
      height01 = (res.windowHeight-50)/562
      width01 = ((562*height01)/1.49866)/ 375;
    }
    console.log("图片高", 562 * height01)  
    console.log("图片宽", ((562 * height01) / 1.49866))
    console.log("height01width01", height01, width01)
    console.log("id1", res.windowWidth, res.windowHeight)
    that.setData({
      screenWidth: res.windowWidth,
      screenHeight: res.windowHeight-50
    })
  } catch (e) {
    // Do something when catch error
  }
}


function unicode_len(nickName){
  var l = nickName.length;
  var blen = 0;
  var blen1 = 0;
  var blenAZ = 0;
  for (var i = 0; i < l; i++) {
    if ((nickName.charCodeAt(i) & 0xff00) != 0) {
      console.log("汉字", nickName.charAt(i))
      blen1++;
    } else {
      if (nickName.charCodeAt(i) >= 0x0041 & (nickName.charCodeAt(i) <= 0x005a)) {
        console.log("大写和符号", nickName.charAt(i))
        blenAZ++
      } else {
        console.log("小写字母", nickName.charAt(i))
        blen++;
      }
    }
  }
  console.log("小写和符号", blen)
  console.log("汉字", blen1)
  console.log("大写字母", blenAZ)
  return 12 * blen1 + (6.5 * blen) + 1 + blenAZ * 8

}
/*获取用户信息或者注册*/
function register(id,that) {
  console.log("unionId", PI.nickName)
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/wechat_login',
    data: {
      unionid: PI.unionId,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("获取电话号码", res)
      var tel1 = res.data.data.tel
      PI["id"] = res.data.data.id
      app.globalData.PI = PI
      console.log("uid", PI.uid)
      wx.setStorage({
        key: 'PI',
        data: PI,
      })
      //获取到UID后再执行页面初始化内容
      // setqr1(id, that)
      //判断是否已有手机号码
      if (tel1 != null && tel1 != undefined && tel1 != "undefined" && tel1 != "") {
        app.globalData.tel = tel1
        wx.setStorage({
          key: 'tel',
          data: tel1,
        })
      }
      //判断是否进入广告页面
      //判断是否进入文章内页
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '注册/登录失败',
      })
    },

  })
}
