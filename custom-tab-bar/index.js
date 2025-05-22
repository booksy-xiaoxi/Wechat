Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "查询"
      },
      {
        pagePath: "/pages/second/second",
        text: "查询结果"
      }
    ]
  },
  lifetimes: {
    attached() {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const page = pages[pages.length - 1];
        const route = page.route;
        const index = this.data.list.findIndex(item => item.pagePath === route);
        if (index !== -1) {
          this.setData({ selected: index });
        }
      }
    }    
  },
  methods: {
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      const index = e.currentTarget.dataset.index;
  
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = '/' + currentPage.route;
  
      if (currentRoute === path) {
        // 当前就是这个页面，只更新选中状态
        this.setData({ selected: index });
        return;
      }
  
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    },
    playAudio(e) {
      const name = e.currentTarget.dataset.audio;
      const audio = wx.createInnerAudioContext();
      audio.src = `/assets/audio/${name}.mp3`;
      audio.play();
    }
  },  
  ready() {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const page = pages[pages.length - 1];
      const route =  page.route;
      const index = this.data.list.findIndex(item => item.pagePath === route);
      if (index !== -1) {
        this.setData({ selected: index });
      }
    }
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  }
});
