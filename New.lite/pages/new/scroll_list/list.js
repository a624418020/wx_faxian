
var windowHeight, length = 0, height = [], mydate = []//用于保存所有已有的日期
var display_data = []//用来保存当前显示的三个日期
var change = 0//防止动画每次都切换
var only_load = true;//防止上拉加载触发多次；
var time_load = true;//2秒内只能触发一次
var nummber_final = 0;//最后一期期号
Page({
  /** 
   * 页面的初始数据 
   */
  data: {
    opacity: 0,//动画停止时将其他的变透明
    data: ''//页面内容数据
  },
  // toView: 'inToView03',
  onLoad: function (options) {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    this.animation = animation
    getdata(this)
  },

  scroll: function (e) {
    var that = this
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(function () {
      var index = inivtitle(e.detail.scrollTop)
      if (change != index) {
        change = index
        if (e.detail.deltaY > 0) {
          //动画
          animation(that, index, 47)
        } else {
          //动画
          animation(that, index, -47)
        }
      }
      delete this.timeoutId;
    }.bind(this), 500);
  },
  scrolltolower: function (e) {
    if (only_load && time_load && nummber_final > 0) {
      time_load = false
      only_load = false
      setTimeout(function () {
        time_load = true
      }, 2000)
      console.log('应该去加载了', e, nummber_final)
      loadmore(this)
    }
  }
})

function getdata(that) {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_news',
    data: {
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      // var data = data_processing(res.data.data)
      // console.log('data', data)
      // //为了上下都有能滑动，所以扔进去三个时间
      // display_data.push(mydate[0])
      // display_data.push(mydate[0])
      // display_data.push(mydate[0])
      // that.setData({
      //   data: data,
      //   display_data: display_data
      // })
      // console.log('display_data', display_data)
      // console.log('mydate', mydate)
      getSystemInfo(that, res.data.data)
    },
    fail: function (e) {
      // fail
    },
    complete: function () {
      wx.hideLoading()
    }
  })
}

//上拉加载
function loadmore(that) {
  wx.request({
    url: 'https://a.milaipay.com/Api/Applettest/applet_news',
    data: {
      number: nummber_final
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      var data = that.data.data
      Array.prototype.push.apply(data, data_processing(res.data.data))
      console.log('data', data)
      //为了上下都有能滑动，所以扔进去三个时间
      that.setData({
        data: data,
      })
    },
    fail: function (e) {
      // fail
    },
    complete: function () {
      only_load = true
      wx.hideLoading()
    }
  })
}
//获取屏幕高度
function getSystemInfo(that, data) {
  var query = wx.createSelectorQuery()
  query.select('.getheight').boundingClientRect()
  query.exec(function (res) {
    windowHeight = Math.round(res[0].height) 
    console.log(windowHeight);
    let a = data_processing(data)
    //为了上下都有能滑动，所以扔进去三个时间
    display_data.push(mydate[0])
    display_data.push(mydate[0])
    display_data.push(mydate[0])
    that.setData({
      data: a,
      display_data: display_data
    })
    console.log('display_data', display_data)
    console.log('mydate', mydate)

  })
}

//首图进行数据处理
function data_processing(data, headnumber) {

  var article = [], article2 = {}, headlines = [], ismain = []
  var headlines1 = {};
  var article1 = [];
  var a = 0, number = -1
  for (var i = 0; i < data.length; i++) {
    if (data[i].number != headnumber) {
      if (number == -1 || data[i].number == number) {
        article.push(data[i])
        nummber_final = data[i].number
      } else {

        //控制数据精确小数点后两位
        length = length.toFixed(3)
        length = parseFloat(length)
        height.push((length * windowHeight) - 300)
        //控制数据精确小数点后两位
        article2["article"] = article
        article2["length"] = length
        console.log("article2", article2)
        article = []
        article1.push(article2)
        article2 = {}
        article.push(data[i])
      }
      number = data[i].number
      //处理时间

      if (data[i].tips == 1) {
        length = length + 0.91
        data[i].title = data[i].title.split("：")
      } else {
        length = length + 0.56
        data[i].title = data[i].title.split("丨")
      }
    }
  };
  height.push((length * windowHeight) - 300)
  article2["article"] = article
  article2["length"] = length
  console.log("article2", article2)
  article1.push(article2)

  //遍历MAP排序
  for (var key in article1) {
    mydate.push(datatime(article1[key].article[0].date)) //拿到时间
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
  console.log("article1", article1)
  if (wx.openBluetoothAdapter) {
    wx.hideLoading()
  }
  return article1

}
//时间处理
function datatime(time) {
  var yue = new Array("Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec.")
  var arr = time.split("-")
  var date = [];
  date.push(yue[arr[1] - 1] + arr[0])
  date.push(arr[2])
  return date;
}
//二分法
function inivtitle(value) {
  var low = 0;
  var i = 0
  var high = height.length - 1;
  console.log("height", height)
  while (low <= high && i < 10) {
    i++
    var middle = Math.floor((low + high) / 2);
    if (value < height[0]) {
      return 0
    }
    if (value >= height[middle - 1] & value <= height[middle]) {
      return middle;
    }
    if (value > height[middle]) {

      low = middle + 1;
    }
    if (value < height[middle]) {
      high = middle - 1;
    }
  }
  return -1;
}
//日历上下移动画
function animation(that, index, i) {
  if (i > 0) {
    display_data[0] = mydate[index]//下移最上数据改变
  } else {
    display_data[2] = mydate[index]//上移最下数据改变
  }
  that.animation.translateY(i).step()
  that.setData({
    animationData: that.animation.export(),//自行动画
    display_data: display_data,//改变数据结构
    opacity: 1//显示
  })
  that.animation.translateY(0).step({ duration: 0 })//动画样式

  setTimeout(function () {
    display_data[1] = mydate[index]
    that.setData({
      animationData: that.animation.export(),//位置归位
      display_data: display_data,//动画结束后数据归位
      opacity: 0,//动画停止时将其他的变透明
    })
  }, 500)
}
