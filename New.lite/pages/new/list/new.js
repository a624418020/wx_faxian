//index.js
//scene=id/*814  无限制二维码参数
//scene=from/*201756  无限制二维码参数(用作文章预览)
//from = 301008  期号
//id=1&new=607  进入文章内页
// pages/new/start/start.js
/*广告接口 几个参数 
1,是否显示、
2显示内容（图片地址）
3显示时间长短（一开始设置3） 
4显示文章内页（1）或期号页（0）
5内页文章id或者期号
visible:1
image:...
time:3
select:0
id:201787
 */

var app = getApp()
var type, that, headid, index = 0, Only = true
var index1 = 0
var appid = 'wxa9f5672aa584035c'
var secret = '784f07488fe02e84300f570bb6cd695e'
var UID = require("../../../utils/uid.js");
var billboard//来自于那个广告牌
var dianzhan = {}//本地判断是否点赞
var Allload = {};//用于存储获取到的新闻数据；
var load = [];//当前页面显示的数据
var length = 0;//获取的当前数据的长度
var is_likedata = "2";//当前页面点赞状态
var number1//广告带的文章ID
var myDate//时间
var Onlyone = true//防止多次点击
var loding = 0//防止重复加载
// var fromdata1//页面进入时带的数据
var scene //永久码带来的参数
var preview//预览码识别
var PI = {};
var select//用于判断是进入文章内页还是置顶
var is_headlines = [];
var timer1;//动画定时Q   
var animation;//动画
var fromdata1//页面传值
var ad_data_t = []//用于存储搜索框广告数据
var ad_data_b = []//用于存储首页弹窗广告数据
/*当前滚动的页面位置*/;
var indexdata = 0;//下拉刷新维护的一个常量。防止误操作。

Page({
  data: {
    objectArray: {},//保存正常进入时的数据
    headid: "",//如果是扫码进入那么用于保存期号参数
    current: index,//当前显示的页面
    is_headlines: "",//保存扫码进入时的数据
    carousel: 1,//控制轮播图是否显示
    is_zt: true,//
    animationData: {},// 动画
    fx: false,
    ad_or: false,//默认没有广告
    sx: 0
  },
  //分享 
  onShareAppMessage: function () {
    //判断是不是有头条图
    var title
    if (this.data.is_headlines == undefined || this.data.is_headlines == "" || this.data.is_headlines == null) {
      console.log("number", index)
      var number = this.data.objectArray[index].headlines[0].number
      title = this.data.objectArray[index].headlines[0].title
      console.log("number", number)
    } else {
      //如果有首图,当中位置是index0就转发顶位图
      if (index == 0) {
        console.log("number2", this.data.is_headlines)
        var number = this.data.is_headlines[0].headlines[0].number
        title = this.data.is_headlines[0].headlines[0].title
        console.log("number2", number)
      } else { //如果有首图,当中位置是index1就转发正文第一篇图
        index = index - 1
        console.log("number", index)
        var number = this.data.objectArray[index].headlines[0].number
        title = this.data.objectArray[index].headlines[0].title
        console.log("number", number)
      }

    }
    return {
      title: title,
      path: 'pages/new/list/new?from=' + number
    }
  },
  //初始化
  onLoad: function (fromdata) {
    that = this
    Only = true
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '您当前微信版本过低，可能有些功能无法正常运行'
      })
    }
    if (wx.openBluetoothAdapter) {
      wx.showLoading({
        title: '加载中',
      })
    }
    console.log("onLoad", fromdata)
    if (fromdata.from == 208888) {
      fromdata.from = 201949
    }
    fromdata1 = fromdata
    headid = fromdata.from//头条号码
    console.log("headid", fromdata.from)
    load = []//清空
    index = 0
    billboard = fromdata.billboard
    scene = decodeURIComponent(fromdata.scene)//永久码进入时带的参数

    PI = app.globalData.PI
    app.globalData.activityID = fromdata.activityID//活动ID
    myDate = new Date();

    if (fromdata.ad_id > -1) {
      app.globalData.ad_id = fromdata.ad_id
      getad(that, 1, "https://a.milaipay.com/Api/applettest/getAdverByNunber")//获取搜索条广告
    } else {
      getad(that, 1, "https://a.milaipay.com/Api/applettest/getAdver")//获取搜索条广告
    }
    if (fromdata.preview == 1) {
      preview = fromdata.preview
    }
    that.setData({
      current: index
    })
    //判断有没有uid,就等待系统获取到uid
    if (PI.uid == null || PI.uid == undefined || PI.uid == "") {
      dinshi(that, 6)
    }else{
      initialize()
      qr()
    }
      
  },

  onShow: function () {
    // ad_data_t.sort(function () {
    //   return (0.5 - Math.random());
    // })
    clearTimeout(timer1)
    animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 300,
      timingFunction: "ease",
      delay: 0
    })
    animation.width("666rpx").step()
    if (ad_data_t.length>0){
      this.setData({
        ad_data_t: ad_data_t[0],
      })
    }
    this.setData({
      animationData: animation.export(),
      logo: true
    })
    timer1 = setTimeout(function () {
      animation.width("50rpx").step()
      that.setData({
        animationData: animation.export(),
        logo: false
      })
    }, 5000)//定时

  },
  onHide: function () {
    clearTimeout(timer1)
  },
  onUnload: function () {
    clearTimeout(timer1)
  },

  //搜索
  search: function () {
    if (Onlyone) {
      Onlyone = false
      if (ad_data_t == undefined || ad_data_t == null || ad_data_t == "") {
        wx.navigateTo({
          url: "../search/search"
        })
      } else {
        wx.navigateTo({
          url: "../search/search?advertising=" + ad_data_t[0].string2 + "&ad_id=" + ad_data_t[0].id_detail + "&ad_image=" + ad_data_t[0].img2 + "&type=" + ad_data_t[0].index_type
        })
      }

      setTimeout(function () {
        Onlyone = true
      }, 2000)
    }
  },
  //动态设置广告宽度
  imageLoad:function(e){
    let originalWidth = e.detail.width;
    let originalHeight = e.detail.height; 
   let imageWidth=(originalWidth / originalHeight) *34
   this.setData({
     imageWidth: imageWidth
   })
  },

  onclick_ad: function () {
    this.setData({
      ad_or: false
    })
  },
  //首页弹窗广告
  onclick_ad_t: function () {
    if (ad_data_b[0].id_detail!=0){
    switch (ad_data_b[0].index_type) {
      case "1": wx.navigateTo({
        url: "../news/article?id=" + ad_data_b[0].id_detail
      })
        break;
      case "2": wx.navigateTo({
        url: "../../topic/vote/vote?id=" + ad_data_b[0].id_detail
      })
        break;
      case "3": wx.navigateTo({
        url: "../../web/web?id=" + ad_data_b[0].id_detail
      })
        break;
    }
    }
  },

  button: function () {
    if (Onlyone) {
      Onlyone = false
      setTimeout(function () {
        Onlyone = true
      }, 2000)
      if (select == 1) {
        wx.navigateTo({
          url: "../news/article?id=" + number1
        })

      }

    }

  },
  current: function (e) {
    if (loding == 0) {
      //获取当前页面ID
      index = e.detail.current
      console.log("拿到id", e.detail.current)
      console.log("最后一个期号", that.data.objectArray.length)
      if (index + 1 == that.data.objectArray.length) {
        console.log("走到这")
        loding = 1
        html(that.data.objectArray[index].headlines[0].number)
      }
    }
  },


  onclick: function (e) {
    if (Onlyone) {
      Onlyone = false
      console.log("拿到id", e)
      //上传数据
      index1 = e.currentTarget.dataset.index
      wx.navigateTo({
        url: '../news/article?id=' + e.currentTarget.id + "&index=" + index
      })
      console.log("点击了新闻")
      setTimeout(function () {
        Onlyone = true
      }, 2000)
    }

  },
})

//上拉加载数据
function html(id) {
  if (wx.openBluetoothAdapter) {
    wx.showLoading({
      title: '加载中',
    })
  }
  console.log("id", id)
  if (id == undefined || id == null) {
    return
  }
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_news',
    data: {
      number: id
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("res", res)
      //到底了就跳出
      if (res.data.status != 1) {
        return
      }
      if (res.data.msg != 'success') {
        wx.showToast({
          title: res.data.msg,
          image: "/images/warn.png",
          duration: 2000
        })
        return
      }
      console.log("Allload", Allload)
      Allload = data_processing(res.data.data, headid)
      for (var i = 0; i < length; i++) {
        load.push(Allload[i])
      }
      length = 0;
      that.setData({
        objectArray: load,
      })
      console.log("objectArray0", that.data.objectArray)
      if (wx.openBluetoothAdapter) {
      }

      wx.stopPullDownRefresh()
      // success
    },
    fail: function () {
      // fail
    },
    complete: function () {
      wx.hideLoading()
      loding = 0;
    }
  })
}
//第一次获取数据不要传任何参数，所以只能重写一个这个方法
function html0() {
  console.log("走了这个", )
  //正常情况下这个接口永远只走一次
  if (!Only) {
    return
  }
  Only = false
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_news',
    data: {
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log(res)

      Allload = data_processing(res.data.data, headid)
      console.log("Allload0", Allload)
      for (var i = 0; i < length; i++) {
        load.push(Allload[i])
      }
      that.setData({
        objectArray: load,
      })
      console.log("objectArray000", that.data.objectArray)
      console.log("load000", load)

      wx.stopPullDownRefresh()
      // success
    },
    fail: function (e) {
      wx.reportAnalytics('bug_1', {
        bug: JSON.stringify(e),
      });
      console.log("获取数据失败", e)
      wx.showModal({
        title: '提示',
        content: '获取数据失败！！',
        confirmText: "刷新",
        success: function (res) {
          if (res.confirm) {
            Only = true
            html0()
          } else if (res.cancel) {
          }
        }
      })
      // fail
    },
    complete: function () {
        wx.hideLoading()
    }
  })
}

//扫码进去
function getdata(number_data) {
  console.log("id", number_data)
  wx.request({
    url: 'https://a.milaipay.com/mspt/Applet/returnTitle',
    data: {
      ly: number_data,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      // console.log("返回标题", res);      
      var title = res.data.data[0];
      wx.setNavigationBarTitle({
        title: title
      })
      console.log("返回标题", title);
    },
    fail: function (res) {
      var title = '发现';
      wx.setNavigationBarTitle({
        title: title
      })
    },
    complete: function (res) {
      // complete
    }
  })
  console.log("number_data", number_data);
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/getNewsByNumber',
    data: {
      number: number_data,
      preview: preview,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("扫码进去", res)
      //   console.log("扫码进去headid", headid)
      headid = headid + ""
      var headid1 = headid.substring(0, 1)
      //如果期号是3开头的的是新闻样式
      if (headid1 == "3") {
        var newlist = res.data.data;
        console.log("newlist", newlist)
        for (var i = 0; i < newlist.length; i++) {
          for (var j = (newlist.length) - 1; j > i; j--) {
            if (parseInt(newlist[j].tips) > parseInt(newlist[j - 1].tips)) {
              var b
              b = newlist[j]
              newlist[j] = newlist[j - 1]
              newlist[j - 1] = b
              b = []
            }
          }
        }

        if (headid.substring(0, 6) == "301008") {
          if (wx.openBluetoothAdapter) {
          }
          //因领导特殊化，301008是模式5样式显示
          that.setData({
            headid: headid,
            carousel: 5,
            is_headlines: newlist,
          })
          return
        }
        that.setData({
          is_headlines: newlist,
          carousel: 3
        })
        //如果期号是4开头的的是大图带小图样式选择
      } else if (headid1 == "4") {
        if (wx.openBluetoothAdapter) {

        }
        that.setData({
          headid: headid,
          is_zt: false,
          is_headlines: data_processing_1(res.data.data),
        })
        //如果期号是5开头的的是翻页纯大图显示
      } else if (headid1 == "5") {
        if (wx.openBluetoothAdapter) {

        }
        that.setData({
          headid: headid,
          carousel: 5,
          is_headlines: res.data.data,
        })
        //大图带小图样式
      } else {
        html0()
        console.log("扫码进去2", is_headlines)
        that.setData({
          headid: headid,
          is_headlines: data_processing(res.data.data),
        })
      }

      wx.stopPullDownRefresh()
      // success
    },
    fail: function (res) {
      wx.reportAnalytics('bug_1', {
        bug: JSON.stringify(res),
      });
      console.log("获取数据失败", res)
      wx.showModal({
        title: '获取数据失败',
        content: '请重新扫描二维码！',
        confirmText: "刷新",
        success: function (res) {
          if (res.confirm) {
            getdata(headid)
          } else if (res.cancel) {
          }
        }
      })
    },
    complete: function (res) {
      wx.hideLoading()
    }
  })
}


//首图进行数据处理
function data_processing(data, headnumber) {
  length = 0;
  var article = [], article2 = {}, headlines = [], ismain = []
  var headlines1 = {};
  var article1 = [];
  var a = 0, number = -1
  for (var i = 0; i < data.length; i++) {
    if (data[i].number != headnumber) {
      if (number == -1 || data[i].number == number) {

        if (data[i].tips == 1) {
          console.log("这这这", data[i].tips)
          headlines.push(data[i])

        } else {
          article.push(data[i])
        }

      } else {

        article2["headlines"] = headlines;

        headlines = []
        article2["article"] = article
        console.log("article2", article2)
        article = []
        article1.push(article2)
        article2 = {}
        a++
        if (data[i].tips == 1) {
          headlines.push(data[i])

        } else {
          article.push(data[i])
        }
      }


      number = data[i].number
      //处理时间

      try {

        if (data[i].date != null) {
          data[i].date = datatime(data[i].date)
        } else {
          data[i].date = time(data[i].time)
        }
      } catch (e) {
        data[i].date = time(data[i].time)
      }
    }
  };

  article2["headlines"] = headlines;
  article2["article"] = article
  console.log("article2", article2)
  article1.push(article2)

  //遍历MAP
  for (var key in article1) {
    length = length + 1;//数据的长度，
    for (var i = 0; i < article1[key].article.length; i++) {
      for (var j = (article1[key].article.length) - 1; j > i; j--) {
        if (parseFloat(article1[key].article[j].tips) < parseFloat(article1[key].article[j - 1].tips)) {
          var b
          b = article1[key].article[j]
          article1[key].article[j] = article1[key].article[j - 1]
          article1[key].article[j - 1] = b
          b = []
        }
      }
    }
  }
  //如果没有选择首图，那么第一篇文章是首图
  for (var key in article1) {
    if (article1[key].headlines.length < 1) {
      article1[key].headlines[0] = article1[key].article[0]
      article1[key].article.splice(0, 1)
    };
  }
  console.log("article1", article1)
  if (wx.openBluetoothAdapter) {
    wx.hideLoading()
  }
  return article1

}
//特殊进行数据处理
function data_processing_1(data, headnumber) {
  length = 0;
  var article = [], article2 = {}, headlines = [], ismain = []
  var headlines1 = {};
  var article1 = [];
  var a = 0, number = -1
  for (var i = 0; i < data.length; i++) {
    if (data[i].number != headnumber) {
      if (number == -1 || data[i].number == number) {
        article.push(data[i])
      } else {

        article2["headlines"] = headlines;

        headlines = []
        article2["article"] = article
        console.log("article2", article2)
        article = []
        article1.push(article2)
        article2 = {}
        a++
        article.push(data[i])
      }


      number = data[i].number
      //处理时间

      try {

        if (data[i].date != null) {
          data[i].date = datatime(data[i].date)
        } else {
          data[i].date = time(data[i].time)
        }
      } catch (e) {
        data[i].date = time(data[i].time)
      }
    }
  };

  article2["headlines"] = headlines;
  article2["article"] = article
  article1.push(article2)
  //遍历MAP
  for (var key in article1) {
    length = length + 1;//数据的长度，
    for (var i = 0; i < article1[key].article.length; i++) {
      for (var j = (article1[key].article.length) - 1; j > i; j--) {
        if (parseFloat(article1[key].article[j].orders) > parseFloat(article1[key].article[j - 1].orders)) {
          var b
          b = article1[key].article[j]
          article1[key].article[j] = article1[key].article[j - 1]
          article1[key].article[j - 1] = b
          b = []
        }

      }
    }
  }
  //如果没有选择首图，那么第一篇文章是首图
  for (var key in article1) {
    if (article1[key].headlines.length < 1) {
      article1[key].headlines[0] = article1[key].article[0]
      article1[key].article.splice(0, 1)
    };
  }
  console.log("article1", article1)
  if (wx.openBluetoothAdapter) {
    wx.hideLoading()
  }
  return article1

}

//时间处理
function time(time) {
  var yue = new Array("Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.")
  var date = new Date(time * 1000);
  var Y = date.getFullYear();
  var M = yue[date.getMonth()];
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return (M + D + '\n' + Y);
}
function datatime(time) {
  var yue = new Array("Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.")
  var arr = time.split("-")
  return (yue[arr[1] - 1] + arr[2] + '\n' + arr[0]);
}

//地铁扫码信息上传数据
function dataup(number, id) {
  console.log("del_like")
  if (wx.openBluetoothAdapter) {
    wx.reportAnalytics('dataup', {
      uid: PI.uid,
      tid: id,
      number: number,
      billboard: billboard,
    });
  }
  console.log("del_like")
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/applet_billboard',
    data: {
      uid: PI.uid,
      tid: id,
      number: number,
      billboard: billboard,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("del_like1", res)
      if (res.data.status == "1") {
        getsubwaydata(billboard)
      } else {
        return false
      }
    },
    fail: function (res) {

    },
    complete: function (res) {
    }
  })
}

//获取地铁码中数据
function getsubwaydata(id) {
  console.log("getsubwaydata", id)
  wx.request({
    url: 'https://a.milaipay.com/Api/Applet/getAdverByBillboard',
    data: {
      billboard: id,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("list", res.data)
      if (res.data.status == "1") {
        //版本判断
        if (wx.openBluetoothAdapter) {
          console.log("getsubwaydata", getsubwaydata)
          wx.reportAnalytics('subway', {
            y_uid: PI.uid,
            y_name: PI.nickName,
            g_id: res.data.data.id,
            g_road: res.data.data.road,
            g_address: res.data.data.address,
            g_level: res.data.data.level,
            g_place: res.data.data.place,
            g_abbreviated: res.data.data.abbreviated,
            g_light_box: res.data.data.light_box,
            g_name: res.data.data.name,
            g_detail: res.data.data.detail,
            g_type: res.data.data.type,
            g_is_sc: res.data.data.is_sc,
          });
        }

      } else {
        return false
      }
    }
  })
}
//初始化信息，根据码的数据选择跳转页面
function initialize() {

  if (typeof (headid) == "undefined" || headid.length == 0) {
    html0()
  } else {
    if (headid > 10) {
      console.log("headid", headid)
      app.globalData.headid = headid;
      getdata(headid)
      wx.setNavigationBarTitle({
        title: "发现 "
      })
    }
  }
  //判断是否需要上传数据
  if (billboard == 0 || billboard == undefined || billboard == "") {
    //没有广告牌所以不上传数据
  } else {
    if (headid == undefined) {
      headid = "首页"
    }
    //判断是进入首页还是文章内页
    if (fromdata1.id == 1) {
      dataup(0, fromdata1.new)
    } else {
      //上传数据
      dataup(headid, 0)
    }
    //提供测试用
    if (wx.getStorageSync('developer') == 1) {
      wx.navigateTo({
        url: '../cs/cs?billboard=' + billboard
      })
    }
  }
  //如果id等于1那么就跳转文章内页
  if (fromdata1.id == 1) {
    wx.navigateTo({
      //文章ID和文章排版类型
      url: '../news/article?id=' + fromdata1.new + "&index=" + index
    })
  }


}

//处理无限次码进入途径
function qr() {
  if (!(scene == null || scene == undefined)) {
    var arr = scene.split("/*");
    if (arr.length > 1) {
      console.log("arraaa", arr)
      var id = arr[1]
      if (arr[0] == "id") {
        wx.navigateTo({
          url: "../news/article?id=" + id
        })
      }

      // if (arr[0] == "csid") {
      //   wx.navigateTo({
      //     url: "../news/article?id=" + id
      //   })
      // }
      if (arr[2] == "preview") {
        preview = arr[3]
      }
      if (arr[0] == "from") {
        headid = id//如果是进入首页就把期号传进去
        getdata(id)
      }
    }
  }

}

//搜索广告数据
//1搜索框广告  //2  首页广告
//https://a.milaipay.com/Api/applettest/getAdver
function getad(that, type_d, url) {
  console.log("广告app.globalData.ad_id",app.globalData.ad_id) 
  wx.request({
    url: url,
    data: {
      type: type_d,
      number: app.globalData.ad_id
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
      if (res.data.status == 1 && res.data.data.length > 0) {
        console.log("广告" + type_d, res)

        if (type_d == 1) {
          ad_data_t = res.data.data
          ad_data_t.sort(function () {
            return (0.5 - Math.random());
          })
          app.globalData.ad_id = ad_data_t[0].number
          getad2(that, 2)
          that.setData({
            ad_data_t: ad_data_t[0]
          })
        }
  
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

//搜索广告数据
//1搜索框广告  //2  首页广告
function getad2(that, type_d) {
  console.log("app.globalData.ad_id", app.globalData.ad_id)
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
        console.log("广告" + type_d, res)
        var oDate = new Date()
        oDate.getDate();
        if (wx.getStorageSync('oDate') != oDate.getDate()) {
          wx.setStorageSync('oDate', oDate.getDate())
          ad_data_b = res.data.data
          ad_data_b.sort(function () {
            return (0.5 - Math.random());
          })
          that.setData({
            ad_data_b: ad_data_b[0],
            ad_or: true
          })
        }

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
function dinshi(that, num) {
  var  name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      initialize()
      qr()
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

