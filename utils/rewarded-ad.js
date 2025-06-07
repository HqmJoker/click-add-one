// rewarded-ad.js

let rewardedVideoAd = null;

function loadAndShowRewardedAd(onRewarded) {
  // 创建激励视频广告实例
  if (!rewardedVideoAd) {
    rewardedVideoAd = wx.createRewardedVideoAd({
      adUnitId: 'your-ad-unit-id'
    });

    // 监听广告关闭
    rewardedVideoAd.onClose((res) => {
      if (res && res.isEnded) {
        // 正常播放结束，可以下发奖励
        if (typeof onRewarded === 'function') {
          onRewarded();
        }
      } else {
        // 提前关闭广告
        wx.showToast({
          title: '观看完整广告才能获得奖励哦~',
          icon: 'none'
        });
      }
    });

    // 监听加载错误
    rewardedVideoAd.onError((err) => {
      wx.showToast({
        title: '广告加载失败，请稍后重试',
        icon: 'none'
      });
      console.error('激励视频广告加载失败:', err);
    });
  }

  // 加载并展示广告
  rewardedVideoAd.load()
    .then(() => rewardedVideoAd.show())
    .catch(err => {
      // 加载失败，尝试重新加载
      console.error('激励视频广告显示失败:', err);
      wx.showToast({
        title: '广告显示失败，请稍后重试',
        icon: 'none'
      });
    });
}

module.exports = {
  loadAndShowRewardedAd
};