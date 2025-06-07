// remove-ads.js

const ADS_REMOVED_KEY = 'adsRemoved';

// 检查是否已去广告
function isAdsRemoved() {
  return !!wx.getStorageSync(ADS_REMOVED_KEY);
}

// 模拟购买去广告
function showRemoveAdsModal(onSuccess) {
  wx.showModal({
    title: '去除广告',
    content: '是否花费 ¥6 去除所有广告？\n\n去广告后，游戏体验将更加纯净，感谢你的支持！',
    confirmText: '确认去除',
    cancelText: '再想想',
    success(res) {
      if (res.confirm) {
        wx.setStorageSync(ADS_REMOVED_KEY, true);
        wx.showToast({
          title: '广告已成功去除，感谢支持！',
          icon: 'success'
        });
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else if (res.cancel) {
        wx.showToast({
          title: '期待你下次支持哦~',
          icon: 'none'
        });
      }
    }
  });
}

module.exports = {
  isAdsRemoved,
  showRemoveAdsModal
};