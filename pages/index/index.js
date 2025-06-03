// index.js
Page({
  data: {
    isActive: false
  },

  // 按钮触摸事件
  onTouchStart() {
    this.setData({ isActive: true });
  },

  onTouchEnd() {
    this.setData({ isActive: false });
    this.handleCameraClick(); // 调用统一跳转方法
  },
  onShow() {
    if (this.getTabBar && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },
  // 统一跳转逻辑
  handleCameraClick() {
    wx.navigateTo({
      url: '/pages/camera/camera'  
    })
  }
});