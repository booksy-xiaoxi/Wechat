// pages/second/second.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 'warning',// 可为 'safe', 'danger', 'warning'
    audioUrl: 'https://yourserver.com/audio/example.mp3' // 替换为你的音频链接
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
  playAudio() {
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = this.data.audioUrl;
    innerAudioContext.play();

    innerAudioContext.onPlay(() => {
      console.log('开始播放');
    });

    innerAudioContext.onError((res) => {
      console.error('播放出错', res.errMsg);
    });
  }
})