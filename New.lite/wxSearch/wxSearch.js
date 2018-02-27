// 定义数据格式

/***
 * 
 * "wxSearchData":{
 *  configconfig:{
 *    style: "wxSearchNormal"
 *  },
 *  view:{
 *    hidden: true,
 *    searchbarHeght: 20
 *  }
 *  keys:[],//自定义热门搜索
 *  his:[]//历史搜索关键字
 *  value
 * }
 * 
 * 
 */
var __keysColor = [];

var __mindKeys = [];

function initColors(colors) {
    __keysColor = colors;
}

function initMindKeys(keys) {
    __mindKeys = keys;
}

function init(that, keyvalue, barHeight, keys, isShowKey, isShowHis, callBack) {
    var temData = {};
    if (keyvalue == 'news') {
        var searchkey = wx.getStorageSync('wxSearchNewsKeys');
        temData.his = searchkey;
    } else {
        var searchkey = wx.getStorageSync('wxSearchHisKeys');
        temData.his = searchkey;
    }
    console.log('searchkey', searchkey)
    var view = {
        barHeight: barHeight,
        isShow: false
    }

    if (typeof (isShowKey) == 'undefined') {
        view.isShowSearchKey = true;
    } else {
        view.isShowSearchKey = isShowKey;
    }

    if (typeof (isShowHis) == 'undefined') {
        view.isShowSearchHistory = true;
    } else {
        view.isShowSearchHistory = isShowHis;
    }
    temData.keys = keys;
    wx.getSystemInfo({
        success: function (res) {
            var wHeight = res.windowHeight;
            view.seachHeight = wHeight - barHeight;
            temData.view = view;
            console.log("1", temData)
            that.setData({
                wxSearchData: temData
            });
        }
    })

    if (typeof (callBack) == "function") {
        callBack();
    }
    if (keyvalue == 'news') {
        getHisKeys(that, 'news');
    } else {
        getHisKeys(that, '');
    }

}

function wxSearchInput(e, that, callBack) {
    var temData = that.data.wxSearchData;
    var text = e.detail.value;
    var mindKeys = [];
    console.log("断点1", temData)
    if (typeof (text) == "undefined" || text.length == 0) {

    } else {
        for (var i = 0; i < __mindKeys.length; i++) {
            var mindKey = __mindKeys[i];
            if (mindKey.indexOf(text) > -1) {
                mindKeys.push(mindKey);
            }
        }
    }
    temData.value = text;
    temData.mindKeys = mindKeys;
    console.log("2", temData)
    that.setData({
        wxSearchData: temData
    });
}

function wxSearchFocus(e, that, callBack) {
    var temData = that.data.wxSearchData;
    temData.view.isShow = true;
    console.log("搜索获取焦点", temData)
    that.setData({
        wxSearchData: temData
    });
    //回调
    if (typeof (callBack) == "function") {
        callBack();
    }
    // if(typeof(temData) != "undefined"){
    //   temData.view.hidden= false;
    //   that.setData({
    //     wxSearchData:temData
    //   });
    // }else{

    // }
}
function wxSearchBlur(e, that, callBack) {
    var temData = that.data.wxSearchData;
    temData.value = e.detail.value;
    console.log("4", temData)
    that.setData({
        wxSearchData: temData
    });
    if (typeof (callBack) == "function") {
        callBack();
    }
}

function wxSearchHiddenPancel(that) {
    var temData = that.data.wxSearchData;
    temData.view.isShow = false;
    console.log("5", temData)
    that.setData({
        wxSearchData: temData
    });
}

function wxSearchKeyTap(e, that, callBack) {
    //回调
    var temData = that.data.wxSearchData;
    temData.value = e.target.dataset.key;
    console.log("6", temData)
    that.setData({
        wxSearchData: temData
    });
    if (typeof (callBack) == "function") {
        callBack();
    }
}


function wxSearchAddNewsKey(that) {
    wxSearchHiddenPancel(that);
    var text = that.data.wxSearchData.value;
    // console.log('新的搜索节点',text)
    if (typeof (text) == "undefined" || text.length == 0) { return; }
    var value = wx.getStorageSync('wxSearchNewsKeys');


    if (value) {
        if (value.indexOf(text) < 0) {
            value.unshift(text);
        }
        wx.setStorage({
            key: "wxSearchNewsKeys",
            data: value,
            success: function () {
                getHisKeys(that, 'news');
            }
        })

    } else {
        value = [];
        value.push(text);
        wx.setStorage({
            key: "wxSearchNewsKeys",
            data: value,
            success: function () {
                getHisKeys(that, 'news');
            }
        })
    }
    console.log('新闻value', value)
}

function wxSearchAddHisKey(that) {
    wxSearchHiddenPancel(that);
    var text = that.data.wxSearchData.value;
    if (typeof (text) == "undefined" || text.length == 0) { return; }
    var value = wx.getStorageSync('wxSearchHisKeys');
    if (value) {
        if (value.indexOf(text) < 0) {
            value.unshift(text);
        }
        wx.setStorage({
            key: "wxSearchHisKeys",
            data: value,
            success: function () {
                getHisKeys(that, '');
            }
        })

    } else {
        value = [];
        value.push(text);
        wx.setStorage({
            key: "wxSearchHisKeys",
            data: value,
            success: function () {
                getHisKeys(that, '');
            }
        })
    }
}




function wxSearchDeleteKey(e, that) {
    var text = e.target.dataset.key;
    var value = wx.getStorageSync('wxSearchHisKeys');
    value.splice(value.indexOf(text), 1);
    wx.setStorage({
        key: "wxSearchHisKeys",
        data: value,
        success: function () {
            getHisKeys(that, '');
        }
    })
}
function wxSearchDeleteAll(that, news) {
    if (news == 'news') {
        wx.removeStorage({
            key: 'wxSearchNewsKeys',
            success: function (res) {
                var value = [];
                var temData = that.data.wxSearchData;
                temData.his = value;
                console.log("8", temData.view)
                that.setData({
                    wxSearchData: temData
                });
            }
        })
    } else {
        wx.removeStorage({
            key: 'wxSearchHisKeys',
            success: function (res) {
                var value = [];
                var temData = that.data.wxSearchData;
                temData.his = value;
                console.log("8", temData.view)
                that.setData({
                    wxSearchData: temData
                });
            }
        })
    }


}
function getHisKeys(that, news) {
    var value = [];
    console.log("news", news)
    if (news == 'news') {
        value = wx.getStorageSync('wxSearchNewsKeys')
    } else {
        value = wx.getStorageSync('wxSearchHisKeys')
    }
    try {
        if (value) {
            // Do something with return value
            var temData = that.data.wxSearchData;
            temData.his = value;
            console.log("名片", temData)
            that.setData({
                wxSearchData: temData
            });
        }

    } catch (e) {
        // Do something when catch error
    }
    console.log("数据", temData)
}



module.exports = {
    init: init,
    initColor: initColors,
    initMindKeys: initMindKeys,
    wxSearchInput: wxSearchInput,
    wxSearchFocus: wxSearchFocus,
    wxSearchBlur: wxSearchBlur,
    wxSearchKeyTap: wxSearchKeyTap,
    wxSearchAddHisKey: wxSearchAddHisKey,
    wxSearchAddNewsKey: wxSearchAddNewsKey,
    wxSearchDeleteKey: wxSearchDeleteKey,
    wxSearchDeleteAll: wxSearchDeleteAll,
    wxSearchHiddenPancel: wxSearchHiddenPancel
}