// pages/topic/vote/vote.js
// huatu.js
var app = getApp()
var magnify//显示百分百
var PI = {};
var that
var data_id
var Min = 0, Max = 10//最大和最小投票，默认最大为10，默认最小为0
var status = "0"//判断当前活动状态
var lock = true;
var checkboxChange_id = [];
var prohibit = {};//超过10票后禁止投票
var color
Page({
  /**
   * 页面的初始数据
   */
  data: {
    summarize: {},//数据
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options)
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter()
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '您当前微信版本过低，可能有些功能无法正常运行'
      })
    }
    that = this
    if (options.id == null || options.id == undefined || options.id == "") {
      wx.showModal({
        title: '提示',
        content: '获取投票ID失败，请重新进入',
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
    } else {
      data_id = options.id;
    }
    PI = app.globalData.PI
    //判断有没有uid,有就是已经登陆过
    //获取uid
    if (PI.uid == null || PI.uid == undefined || PI.uid == "") {
      dinshi(that, 6)
    }else{
      init(that)
    }
    
  },

  checkboxChange: function (e) {
    console.log("Max", Max, Min)
    var va = {};
    checkboxChange_id = e.detail.value
    console.log("checkboxChange", checkboxChange_id, e);
    if (checkboxChange_id.length > (Max - 2) && checkboxChange_id.length < Max) {
      wx.showToast({
        title: '选中 ' + (checkboxChange_id.length) + ' 个',
        icon: 'success',
        duration: 1000
      })
      this.setData({
        va: null
      })
    } else if (checkboxChange_id.length >= Max) {
      for (var i in this.data.summarize.option_list) {
        va[this.data.summarize.option_list[i].id] = true

      }

      for (var i in checkboxChange_id) {
        va[checkboxChange_id[i]] = false
      }

      this.setData({
        va: va
      })
      wx.showToast({
        title: "已达上限",
        image: "/images/icon_close.png",
        duration: 1000
      })
    }
    return e.detail.value
  },

  bt_article: function () {
    var that = this;
    if (that.data.summarize.news_id > 0) {
      wx.navigateTo({
        url: "../../new/news/article?id=" + that.data.summarize.news_id
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '没有文章',
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

  bt_vote: function (e) {
    if (status != "1") {//只有活动正常进行中才能投票
      if (lock) {//防止多次点击
        lock = false
        var that = this;
        var data = that.data.summarize
        console.log("e", e.currentTarget.dataset)
        var id = e.currentTarget.dataset.id;

        var index = e.currentTarget.dataset.index;
        data.option_list[index].ticket_num = data.option_list[index].ticket_num + 1
        console.log("e", data)
        var url = "https://a.milaipay.com/Api/Applettest/vote_single"
        votedata(id, data.activity_id, data, that, url)
      }
    }
  },

  bt_checkbox_vote: function (e) {
    if (status != "1") {//只有活动正常进行中才能投票
      if (lock) {//防止多次点击
        if (checkboxChange_id.length >= Min && checkboxChange_id.length <= Max) {
          var that = this;
          var data = that.data.summarize
          var url = "https://a.milaipay.com/Api/Applettest/vote_all"
          var id = checkboxChange_id.join(',')
          votedata(id, data.activity_id, data, that, url)//投票接口
        } else {
          wx.showModal({
            title: '提示',
            content: '最少选择人数' + Min + ';最多选择人数' + Max + ';当前已选择' + checkboxChange_id.length + '人',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '投票',
      path: 'pages/topic/vote/vote?id=' + data_id
    }
  }
})
//获取数据
function getdata(that, id) {
  wx.request({
    url: "https://a.milaipay.com/Api/Applettest/getVoteDetail?activity_id=" + id,
    data: {
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {

      console.log("res", res)
      if (res.data.status == 1) {
        color = new Array()
        status = res.data.data.status
        if (res.data.data.theme == null || res.data.data.theme == undefined || res.data.data.theme == "") {
          console.log("1111", 1111)
          color = ["fbda40", "ffb449"];
        } else {

          color = res.data.data.theme.split(",")
          console.log("2222", color)
        }
        console.log("theme", color)
        res.data.data.option_list.sort(function () {
          return (0.5 - Math.random());
        })
        var MinAndMax = []

        MinAndMax = res.data.data.MinAndMax.split(",")
        if (MinAndMax.length == 1 && MinAndMax[0] != "") {
          console.log("Max1", MinAndMax)
          Max = MinAndMax[0]
        } else if (MinAndMax.length == 2) {
          console.log("Max2")
          Max = MinAndMax[0] > MinAndMax[1] ? MinAndMax[0] : MinAndMax[1]
          Min = MinAndMax[0] < MinAndMax[1] ? MinAndMax[0] : MinAndMax[1]
        }


        //判断是投票模式
        if (res.data.data.votetype == 1) {
          that.setData({
            groups: 1
          })
        }

        that.setData({
          textcolor: RGB(color[0]),
          bgcolor: color,
          shadowcolor: RGBlevel(color[0], 0.2),
          summarize: process_data(res.data.data),
          a: magnify
        })
        console.log("res", res.data.data)

        if (status != "1") {
          wx.showModal({
            title: '提示',
            content: '活动已下架',
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: "../../new/list/new"
                })
              } else if (res.cancel) {
              }
            }
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '活动已下架',
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: "../../new/list/new"
              })
            } else if (res.cancel) {
              wx.switchTab({
                url: "../../new/list/new"
              })
            }
          }
        })
      }

    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取投票数据失败',
        success: function (res) {
          if (res.confirm) {
            wx.switchTab({
              url: "../../new/list/new"
            })
          } else if (res.cancel) {
            wx.switchTab({
              url: "../../new/list/new"
            })
          }
        }
      })
    }
  })
}
//https://a.milaipay.com/Api/Applettest/vote
//投票接口
function votedata(id, activity_id, data, that, url) {
  console.log("PI", PI.uid, id, activity_id, PI.nickName)
  wx.request({
    url: url,
    data: {
      uid: PI.uid,
      option_id: id,
      activity_id: activity_id,
      nickname: PI.nickName,
      from: "1",
    },
    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    // header: {}, // 设置请求的 header
    header: { 'content-type': 'application/x-www-form-urlencoded' },
    success: function (res) {
      console.log("投票", res)
      if (res.data.status == 1) {
        if (that.data.groups == 1) {
          wx.showToast({
            title: "投票成功",
            icon: 'success',
            duration: 1000
          })
        }
        that.setData({
          summarize: process_data(data),
          a: magnify,
          va: null
        })
        console.log("votedata", res)

      } else {
        wx.showToast({
          title: "已投过",
          image: "/images/icon_close.png",
          duration: 2000
        })
      }

    },
    fail: function (res) {
      console.log("失败", res)
      wx.showModal({
        title: '提示',
        content: '投票失败',
        success: function (res) {
        }
      })
    },
    complete: function () {

      checkboxChange_id = []
      lock = true
    }
  })
}

function process_data(data) {
  var percentage = 0//比值
  var total = 0//总数
  console.log("score", data.option_list)
  for (var key in data.option_list) {
    var score = Number(data.option_list[key].ticket_num);
    data.option_list[key].ticket_num = score;
    total += score;
  }
  for (var key in data.option_list) {
    var score = Number(data.option_list[key].ticket_num);
    console.log("score", score)
    if (score > 999) {
      data.option_list[key].font_size = "40"
      if (score > 99999) {
        data.option_list[key].font_size = "30"
      }
    }
    data.option_list[key].percentage = Math.round((score / total) * 100);
    console.log("percentage" + data.option_list[key], data.option_list[key].percentage)
    percentage = percentage > data.option_list[key].percentage ? percentage : data.option_list[key].percentage
  }
  console.log("percentage", percentage)
  if (percentage < 81) {
    magnify = 81 / percentage
    console.log("magnify", magnify)
  }
  console.log("data", data)
  return data;

}


function RGB(color) {
  if (color.length > 5) {
    var R = parseInt(color.substr(0, 2), 16)
    var G = parseInt(color.substr(2, 2), 16)
    var B = parseInt(color.substr(4, 2), 16)
    var colordata = R * 0.299 + G * 0.587 + B * 0.114;
    if (colordata >= 192) {
      console.log("黑", R, G, B)
      return "#3c2d13";
    } else {
      return "#ffffff";
      console.log("白", R, G, B)
    }
  }

}

function RGBlevel(color, level) {
  var r = /^\#?[0-9a-f]{6}$/;
  if (!r.test(color)) return window.alert("输入错误的hex颜色值");
  var rgbc = HexToRgb(color);
  //floor 向下取整
  for (var i = 0; i < 3; i++) rgbc[i] = Math.floor(rgbc[i] * (1 - level));
  console.log("加深", rgbc[0] + ',' + rgbc[1] + ',' + rgbc[2] + ',' + '0.7')
  return rgbc[0] + ',' + rgbc[1] + ',' + rgbc[2] + ',' + '0.7';
}
function RgbToHex(a, b, c) {
  var r = /^\d{1,3}$/;
  if (!r.test(a) || !r.test(b) || !r.test(c)) return window.alert("输入错误的rgb颜色值");
  var hexs = [a.toString(16), b.toString(16), c.toString(16)];
  for (var i = 0; i < 3; i++) if (hexs[i].length == 1) hexs[i] = "0" + hexs[i];
  return "#" + hexs.join("");
}
function HexToRgb(str) {
  var r = /^\#?[0-9a-f]{6}$/;
  //test方法检查在字符串中是否存在一个模式，如果存在则返回true，否则返回false
  if (!r.test(str))
    //  return window.alert("输入错误的hex颜色值");
    //replace替换查找的到的字符串
    str = str.replace("#", "");
  //match得到查询数组
  var hxs = str.match(/../g);
  //  alert('bf'+hxs)
  for (var i = 0; i < 3; i++) hxs[i] = parseInt(hxs[i], 16);
  //  alert(parseInt(80, 16))
  return hxs;
}

function dinshi(that,num) {
  var name = setInterval(function () {
    num--;
    if (app.globalData.PI.uid != null & app.globalData.PI.uid != undefined & app.globalData.PI.uid != "") {
      PI = app.globalData.PI
      init(that)
      console.log("PI.....PI", PI)
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
function init(that){
  if (app.globalData.SDKVersion) {
  var url = "https://a.milaipay.com/Home/index/vote?activity_id=" + data_id + "&uid=" + PI.uid + "&nickname=" + PI.nickName
  console.log("url", url)
  that.setData({
    url: url
  })}else{
    getdata(that, data_id)
  }
  
}


