// app.js - 小程序入口文件
App({
  // 全局数据，可以在整个应用程序中共享
  globalData: {
    userInfo: null
  },
  
  // 小程序启动时触发
  onLaunch: function() {
    // 从本地存储加载游戏记录
    try {
      const highestNumber = wx.getStorageSync('tapmeHighestNumber') || 1;
      const highestScore = wx.getStorageSync('tapmeHighestScore') || 0;
      this.globalData.highestNumber = highestNumber;
      this.globalData.highestScore = highestScore;
    } catch (e) {
      console.error('加载记录失败:', e);
    }
  }
}) 