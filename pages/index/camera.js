Page({
  data: {
    src: '', // 拍摄后图片路径
    cameraId: '', // 可选，可用于指定相机
  },

  onLoad() {
    this.checkCameraPermission();
  },

  onReady() {
    // 创建相机上下文
    this.ctx = wx.createCameraContext();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar && typeof tabBar.setData === 'function') {
      tabBar.setData({ selected: 0 }); // 设置当前 tab
    }
  },

  checkCameraPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          wx.authorize({
            scope: 'scope.camera',
            success: () => {
              console.log("已授权相机权限");
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要开启相机权限才能使用该功能',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        }
      }
    });
  },

  takePhoto() {
    if (!this.ctx) {
      this.ctx = wx.createCameraContext();
    }
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        });
      },
      fail: (err) => {
        console.error("拍照失败：", err);
      }
    });
  },

  onCameraError(e) {
    console.error("相机启动失败：", e.detail);
  }
});
