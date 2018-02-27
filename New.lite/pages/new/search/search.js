//index.js
//获取应用实例
var WxSearch = require('../../../wxSearch/wxSearch.js')
var app = getApp()
var that
var text
var up = false, i = 1/*上拉加载*/, article = []/*用于存储数据*/, tips = 0/*标签*/
Page({
  data: {
    objectArray: [],
    show:1,
  },
  onLoad: function (onLoad) {
    console.log('onLoad',onLoad)
    that = this
    var ad={}


    ad.show = false
    if (onLoad.advertising != null && onLoad.advertising != undefined && onLoad.advertising !=""){
      text = onLoad.advertising
    }
    if (onLoad.ad_image != null && onLoad.ad_image != undefined && onLoad.ad_image.length >8 ){
      console.log('ad_image', onLoad.ad_image)
      ad.image=onLoad.ad_image
      ad.show = true
      ad.type = onLoad.type
      ad.id = onLoad.ad_id
      that.setData({
        ad: ad
      })
    }else{
      that.setData({
        ad: ad
      })
    }

    //初始化的时候渲染wxSearchdata
    WxSearch.init(that, 'news', 88, ["人物",'知食', '店记', '城事', '艺会']);
  },

  onReady: function () {
      var temData = that.data.wxSearchData;
      temData.value = text;
      that.setData({
        wxSearchData: temData,
      });
  },

  onclick_ad:function(){
    if (this.data.ad.id!=0){
    switch (this.data.ad.type ) {
      case "1": wx.navigateTo({
        url: "../news/article?id=" + this.data.ad.id
      })
        break;
      case "2": wx.navigateTo({
        url: "../../topic/vote/vote?id=" + this.data.ad.id
      })
        break;
      case "3": wx.navigateTo({
         url: "../../web/web?id="  + this.data.ad.id
      })
        break;
    }
  }


    // if (this.data.ad.type==1){
    //   wx.navigateTo({
    //     url: '../news/article?id=' + this.data.ad.id
    //   })
    // }else{
    //   wx.navigateTo({
    //     url: "../../topic/vote/vote?id=" + this.data.ad.id
    //   })
    // }
  },
  wxSearchFn: function (e) {
    var that = this
    if (typeof (text) == "undefined" || text.length == 0) {
      wx.showToast({
        title: '不可为空',
        image: '/images/false.png',
        duration: 2000
      })
      return;
    }
    WxSearch.wxSearchAddNewsKey(that);
    tips = 0
    i=1
    article = []
    getdata(i)
  },
  bindconfirm:function(e){
    var that = this
    article = []
    if (typeof (text) == "undefined" || text.length == 0) {
      wx.showToast({
        title: '不可为空',
        icon: '/images/false.png',
        duration: 2000
      })
      return;
    }
    WxSearch.wxSearchAddNewsKey(that);
    getdata(i)
  },
  onclick: function (e) {
    wx.navigateTo({
      url: '../news/article?id=' + e.currentTarget.id
    })
    console.log("点击了新闻", e.currentTarget.id)
  },
  //清空数据
  delete_image: function () {
    text = ""
    article = []
    console.log("delete_image",text)
    var temData=that.data.wxSearchData;
    temData.value = text;
    that.setData({
      wxSearchData: temData,
     objectArray: article
    });
  },
  //获取输入内容
  wxSearchInput: function (e) {
    var that = this
    console.log("wxSearchInpu",e.detail.value)
    text = e.detail.value;
    WxSearch.wxSearchInput(e, that);

  },
  wxSerchFocus: function (e) {
    text = ""
    tips=0
    console.log("获取焦点",e)
    var that = this
    WxSearch.wxSearchFocus(e, that);
    that.setData({
      objectArray: []
    });
    console.log("获取焦点", that.data.objectArray)
  },
  wxSearchBlur: function (e) {
    var that = this
    WxSearch.wxSearchBlur(e, that);
  },
  //历史记录点击按钮
  wxSearchKeyTap: function (e) {
    WxSearch.wxSearchHiddenPancel(that);
    i=1
    article = []
    text = e.target.dataset.key
    WxSearch.wxSearchKeyTap(e, that);
    up=true
    switch (text){
      case "人物": tips = 1; getismain(tips,1); ; break;
      case "知食": tips = 3; getismain(tips, 1);break;
      case "店记": tips = 4; getismain(tips, 1); break;
      case "城事": tips = 6; getismain(tips, 1);break;
      case "艺会": tips = 5; getismain(tips, 1);break;
      default: tips = 0;getdata(i);break;
    };
    // if (text=="人物"){
    //   console.log("人物")
    //   getismain()
    // }else{
    //   getdata()
    // }

    console.log(text)
  },
  wxSearchDeleteKey: function (e) {
    var that = this
    WxSearch.wxSearchDeleteKey(e, that);
  },
  wxSearchDeleteAll: function (e) {
    var that = this;
    WxSearch.wxSearchDeleteAll(that,'news');
  },
  // wxSearchTap: function (e) {
  //   var that = this
  //   WxSearch.wxSearchHiddenPancel(that);
  // },

  onReachBottom: function () {
    if (this.data.objectArray.length > 5){
    console.log("up", up)
    if(up){
      up = false
      if (tips==null||tips==undefined||tips==""){
        getdata(++i)
    }else{
      getismain(tips, ++i)
    }
    }
  }
  },
})

//https://a.milaipay.com/Mspt/Applet/applet_search 原来测试接口
function getdata(i) {
  up = false
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_search',
    data: {
      content: text,
      page:i
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
    console.log("res...",res)
      if (res.data.status = 1) {
        var article1 = res.data.data;
        for (var key in article1) {
          article.push(article1[key])
        }
        that.setData({
          objectArray: article
        })
        if (article.length < 1) {
          wx.showToast({ 
            title: '暂无对应信息',
            image: "/images/delete.png",
            duration: 2000
          })
        }
        console.log("article", article)
        // success
      }

      // success
    },
    fail: function (res) {
      // fail
    },
    complete: function (res) {
      up = true
    }
  })
}

//搜索人物
function getismain(tips,i) {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/getMainNews',
    data: {
      tips: tips,
      page:i,
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },

    success: function (res) {
      console.log("article", res.data.status)
      if (res.data.status=1){
        var article1 = res.data.data;
        for (var key in article1) {
          article1[key].logo = "http://" + article1[key].logo
          article.push(article1[key])
        }
        that.setData({
          objectArray: article
        })
        console.log("article", article)
      // success
      }
  
    },
    fail: function (res) {
      // fail
    },
    complete: function (res) {
      up = true
    }
  })
}