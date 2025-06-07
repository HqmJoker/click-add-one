const { isAdsRemoved } = require('./remove-ads.js');

let interstitialAd = null;

function showInterstitialAd() {
  if (isAdsRemoved()) {
    // 已去广告，不展示
    return;
  }
  
  // 创建插屏广告实例（只创建一次，后续复用）
  if (!interstitialAd) {
    interstitialAd = wx.createInterstitialAd({
      adUnitId: 'your-interstitial-ad-id'
    });

    // 监听广告加载错误
    interstitialAd.onError((err) => {
      wx.showToast({
        title: '插屏广告加载失败',
        icon: 'none'
      });
      console.error('插屏广告加载失败:', err);
    });

    // 监听广告关闭
    interstitialAd.onClose(() => {
      // 可根据需要处理广告关闭后的逻辑
    });
  }

  // 加载并展示广告
  interstitialAd.load()
    .then(() => interstitialAd.show())
    .catch(err => {
      wx.showToast({
        title: '插屏广告显示失败',
        icon: 'none'
      });
      console.error('插屏广告显示失败:', err);
    });
}

module.exports = {
  showInterstitialAd
};