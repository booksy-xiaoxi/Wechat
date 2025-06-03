Page({
  data: {
    photos: []
  },

  cameraContext: null,

  onReady() {
    this.cameraContext = wx.createCameraContext();
  },

  takePhoto() {
    if (this.data.photos.length >= 3) {
      wx.showToast({
        title: '最多拍3张',
        icon: 'none'
      });
      return;
    }

    this.cameraContext.takePhoto({
      quality: 'high',
      success: (res) => {
        const newPhotos = [...this.data.photos, res.tempImagePath];
        this.setData({ photos: newPhotos });
      },
      fail: (err) => {
        console.error('拍照失败', err);
      }
    });
  },
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    const urls = this.data.photos;
  
    wx.previewImage({
      current: urls[index], // 当前预览的图片
      urls: urls            // 所有图片数组
    });
  },
  
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const newPhotos = this.data.photos.filter((_, i) => i !== index);
    this.setData({ photos: newPhotos });
  },
  goToResultPage() {
    wx.switchTab({
      url: '/pages/second/second' 
    });
  }  
});
