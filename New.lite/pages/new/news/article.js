// pages/new/news/article.js
//超链接功能、发红包功能、广告、分享
var WxParse = require('../../../wxParse/wxParse.js');
var app = getApp()
var PI, Onlyone = true
var Onlyone111 = true
var article = ``;
var id, csid, index, type, ad_show = false;
var dianzhan = {}
var ad_data = []//用于存储首页弹窗广告数据
var activityID//活动ID
Page({
  data: {
    name: "",
    time: "",
    author: "",
    is_yc: false,
    dz: "",
    activity_v: false,//活动页是否显示
    videosrc: "",
    videopic: "",
    activity_id: "",//活动ID
    ad_or: false//默认不显示广告
  },

  onLoad: function (e) {

    var that = this;
    PI = app.globalData.PI
    activityID = app.globalData.activityID
    id = e.id
    var url = "https://a.milaipay.com/Home/Index/article?id=" + e.id + "&show=false" + "&is_litle=1" + "&uid=" + app.globalData.PI.uid + "&activityID=" + activityID + "&number=" + app.globalData.ad_id
    url = trim(url)
    console.log('url', url)
    if (app.globalData.SDKVersion) {
      this.setData({
        url: url
      })
    } else {
      if (wx.showLoading) {
        wx.showLoading({
          title: '加载中',
        })
      }
      dz(that)
      getdata(that)
      console.log('加载', e)
      getad(that, 3)
    }
  },
  onShareAppMessage: function () {
    console.log("分享")
    return {
      title: '发现',
      path: 'pages/new/list/new?id=1&new=' + id + "&from=" + app.globalData.headid
    }
  },

  //页面跳转
  wxParseTagATap: function (e) {

    var a = e.currentTarget.dataset.src;
    console.log("href", a)
    var b = a.split("?")
    console.log("href", b[0])
    var href = b[0].substring(34)
    var id = (b[1].split("="))[1]
    console.log("href", id)
    if (href == "article") {
      wx.navigateTo({
        url: "../news/article?id=" + id
      })
    } else if (href == "vote") {
      wx.navigateTo({
        url: "../../topic/vote/vote?id=" + id
      })
    }
    // if ((href.substring(0,7))=="http://" ){
    //   console.log("aaaaa", href);
    //   href = href.substring(7, href.length)
    // }
    // wx.navigateTo({
    //     url: href,
    //     fail(e) {
    //       console.log("失败原因",e)
    //       //如果因为栈内页面太多导致跳转失败，则清掉3层
    //       if(e.errMsg=="navigateTo:fail webview count limit exceed"){
    //         wx.navigateBack({
    //           delta: 3
    //         })
    //       }else{
    //         wx.showModal({
    //           title: '跳转失败',
    //           content: "请确认跳转地址" + href,
    //         })
    //       }

    //     },
    //   })
  },
  //广告跳转
  onclick_ad: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      switch (e.currentTarget.dataset.type) {
        case "1": wx.navigateTo({
          url: "../news/article?id=" + e.currentTarget.dataset.id
        })
          break;
        // case "2": wx.navigateTo({
        //   url: "../../topic/vote/vote?id=" + e.currentTarget.dataset.id
        // })
        //   break;
        // case "3": wx.navigateTo({
        //   url: "../../web/web?id=" + e.currentTarget.dataset.id
        // })
        //   break;
      }
      console.log("onclick_ad", e.currentTarget.dataset)
    }
    // if (e.currentTarget.dataset.type==1){
    //   wx.navigateTo({
    //     url: '../news/article?id=' + e.currentTarget.dataset.id
    //   })
    // }else{
    //   wx.navigateTo({
    //     url: "../../topic/vote/vote?id=" + e.currentTarget.dataset.id
    //   })
    // }
  },
  //收藏
  sc: function (e) {
    var that = this;
    var is_sc = that.data.is_sc;
    is_sc = (is_sc + 1) % 2
    console.log("is_sc", is_sc)
    if (is_sc == 0) {
      that.setData({
        is_sc: is_sc
      })
      del_like()
    } else {
      that.setData({
        is_sc: is_sc
      })
      add_like()
    }
  },

  //点赞调用接口
  like: function (e) {
    var that = this;
    var is_dz = that.data.is_dz;
    console.log("11111", is_dz)
    if (is_dz == 0) {
      console.log("11111")
      var dz1 = that.data.dz
      if (dz1 < 10000) {
        that.setData({
          dz: parseInt(dz1) + 1,
        })
        getlikes(that)
      } else {
        that.setData({
          dz: data_w(dz1),
        })
        getlikes(that)
      }
    }
  },
  //跳转到活动页面
  participate: function (e) {
    var id = this.data.activity_id;
    // var id = 161;
    console.log("id", id)
    wx.redirectTo({
      url: '../../milaic/activity/activity?id=' + id
    })
  },

  activity: function () {
    const arrayBuffer = new Uint8Array([11, 22, 33])
    if (Onlyone111) {
      Onlyone111 = false
      var that = this;
      //有效值 develop（开发版），trial（体验版），release（正式版） ，
      wx.navigateToMiniProgram({
        appId: 'wxdc2adb82f153402b',
        path: 'milai/milaipay/milaipay?activityid=' + activityID + '&nickname=' + PI.nickName + '&uid=' + PI.uid,
        envVersion: 'trial',
        extraData: {
          activityid: activityID,
          nickname: PI.nickName,
          uid: PI.uid
        },
        success(res) {
          that.setData({
            activity_v: false
          })
          app.globalData.activityID = 0
          // 打开成功
        },
        complete() {

        }
      })
    }
  },

  close_activity: function () {
    this.setData({
      activity_v: false
    })
  },

  share: function (e) {
    if (Onlyone) {
      Onlyone = false
      var title = this.data.name
      console.log("title", title)
      wx.navigateTo({
        url: '../../new/share/share?id=' + id + '&title=' + title
      })
      setTimeout(function () {
        Onlyone = true
      }, 2000)
    }
  }
})


function htmlspecialchars(str) {
  str = str.replace(/&amp;/g, '&');
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&gt;/g, '>');
  str = str.replace(/font-size: medium/g, '');
  str = str.replace(/&quot;/g, '"');
  str = str.replace(/data-src/g, 'src');

  if (type == 3) {
    str = str.replace(/section/g, "p");
  }
  return str;
}
//正常文章数据
function getdata(that) {
  Onlyone111 = true
  var is_yc
  console.log('获取到的id', id)
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_detail',
    data: {
      id: id,
      uid: PI.uid
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    success: function (res) {
      console.log('内容', res)
      if (res.data.status != 1) {
        wx.showModal({
          title: '提示',
          content: '获取网络数据失败。点击确认按钮重新加载数据，或自行重新扫码',
          success: function (res) {
            if (res.confirm) {
              getdata(that)
            } else if (res.cancel) {
              return
            }
          }
        })
      }
      if (wx.openBluetoothAdapter) {
        //上传数据
        wx.reportAnalytics('traffic', {
          traffic01: '1',
          uid: PI.uid,
          rname: PI.nickName,
          id: res.data.data.id,
          textname: res.data.data.title,
        });
      }
      id = res.data.data.id
      type = res.data.data.type

      if (res.data.data.content == undefined || res.data.data.content == null || res.data.data.content.length < 5) {
        wx.showModal({
          title: '提示',
          content: '获取网络数据失败。点击确认按钮重新加载数据，或自行重新扫码',
          success: function (res) {
            if (res.confirm) {
              getdata(that)
            } else if (res.cancel) {
              return
            }
          }
        })
      } else {
        article = htmlspecialchars(res.data.data.content);
        //弹出发红包页面
        //app.globalData.scene==1047只能通过小程序码扫码进入 
        try {
          console.log('红包参数', app.globalData.scene, Number(app.globalData.activityID))
          if (app.globalData.scene == 1047 || app.globalData.scene == 1011 || app.globalData.scene == 1017) {
            if (Number(app.globalData.activityID) >= 1) {
              setTimeout(function () {
                that.setData({
                  activity_v: true
                })
              }, 3000)
            }
          }
        } catch (e) {
        }
      }
      WxParse.wxParse('article', 'html', article, that, 5);
      var videosrc
      try {
        videosrc = res.data.data.video_url.replace(/(^\s*)|(\s*$)/g, "")
      } catch (e) {
        videosrc = ""
      }
      var videopic
      try {
        videopic = res.data.data.video_pic.replace(/(^\s*)|(\s*$)/g, "")
      } catch (e) {
        videopic = ""
      }
      var author
      try {
        author = res.data.data.author
        if (author == null || author == undefined || author == "") {
          author = res.data.data.reprint_source
        }
      } catch (e) {
        author = ""
      }
      var time
      if (res.data.data.date != null) {
        time = res.data.data.date
      } else {
        time = app.time(res.data.data.time)
      }

      if (res.data.data.is_yc == 0) {
        is_yc = false
      } else {
        is_yc = "发现家"
      }
      if (videosrc == ' ') {
        videosrc = '';
      }
      //判断是否显示广告
      if (res.data.data.is_adshow = 0) {
        that.setData({
          ad_or: false
        })
      } else {
        that.setData({
          ad_or: true
        })
      }


      console.log('videosrc', videosrc)
      that.setData({
        name: res.data.data.title,
        time: time,
        videosrc: videosrc,
        videopic: videopic,
        author: author,
        is_sc: res.data.data.is_sc,
        is_yc: is_yc,
        dz: data_w(res.data.data.dz),
        id: id,
        read: data_w(res.data.data.read_count),
        activity_id: res.data.data.activity_id,
        tips: res.data.data.tips
      })
      if (wx.openBluetoothAdapter) {
        wx.hideLoading()
      }

      // success
    },
    fail: function (e) {
      wx.showModal({
        title: '提示',
        content: '获取网络数据失败。点击确认按钮重新加载数据，或自行重新扫码',
        success: function (res) {
          if (res.confirm) {
            getdata(that)
          } else if (res.cancel) {
            return
          }
        }
      })
      // fail
    },
    complete: function () {
      // complete
    }
  })
}




// function read() {
//   wx.request({
//     url: 'https://a.milaipay.com/Api/Applettest/addRedCount',
//     data: {
//       id: id
//     },
//     method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
//     // header: {}, // 设置请求的 header
//     header: {
//       'content-type': 'application/x-www-form-urlencoded'
//     },
//     success: function (res) {
//       //  console.log("aaaaa", res)
//       // success
//     },
//     fail: function () {
//       // fail
//     },
//     complete: function () {
//       // complete
//     }
//   })
// }
//点赞调用接口
function getlikes(that) {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/dz',
    data: {
      news_id: id,
      uid: PI.uid,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("dianz", res)
      if (res.data.status == 1) {
        wx.showToast({
          title: '点赞成功',
          icon: 'success',
          duration: 2000
        })
        that.setData({
          is_dz: 1,
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 2000
        })
      }

      // success
    },
    fail: function (res) {

      // fail
    },
    complete: function (res) {
      // complete
    }
  })
}
//收藏文章
function add_like() {
  console.log("add_like", )
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/doCollection',
    data: {
      activityid: id,
      uid: PI.uid,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("add_like", res)
      if (res.data.status == "1") {
        wx.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 2000
        })
        app.globalData.is_sc = '1';//首页点赞爱心变实心
        console.log("del_like", app.globalData.is_sc)
      } else {
        return false
      }
    }
  })
}
//取消收藏
function del_like() {
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
        app.globalData.is_sc = '0'; //首页点赞爱心变虚心
        console.log("del_like", app.globalData.is_sc)
      } else {
        return false
      }
    }
  })
}

//点赞查询接口
function dz(that) {
  console.log("参数", PI.uid, id)
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/checkDz',
    data: {
      news_id: id,
      uid: PI.uid,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("dianz", res)
      if (res.data.msg == "未点赞") {
        that.setData({
          is_dz: 0,
        })
      } else {
        that.setData({
          is_dz: 1,
        })
      }
    },
    fail: function (res) {
      that.setData({
        is_dz: 0,
      })
      // fail
    },
    complete: function (res) {
      // complete
    }
  })
}
function data_w(data) {
  if (data > 100000) {
    return 10 + "W+"
  }
  if (data > 10000) {
    return parseInt(data / 10000) + "W+"
  } else {
    return data
  }

}

//搜索广告数据
//1搜索框广告  //2  首页广告
function getad(that, type_d) {
  console.log("ad_id", app.globalData.ad_id)
  wx.request({
    url: 'https://a.milaipay.com/Api/applettest/getAdverByNunber',
    data: {
      type: type_d,
      number: app.globalData.ad_id
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
      if (res.data.status == 1 && res.data.data.length > 0) {
        console.log("时间" + type_d, res)
        ad_data = res.data.data
        that.setData({
          ad_data: ad_data,
          ad_show: true
        })
      }

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
function trim(str) {
  return str.replace(/\s+/g, "");
}