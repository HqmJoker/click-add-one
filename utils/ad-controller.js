// ad-controller.js

const ADS_REMOVED_KEY = 'adsRemoved';
const INTERSTITIAL_COOLDOWN_KEY = 'interstitialAdCounter';
const INTERSTITIAL_COOLDOWN = 5; // 每5局显示一次插屏广告

// 引入广告模块
const { loadAndShowRewardedAd } = require('./rewarded-ad.js');
const { showInterstitialAd: rawShowInterstitialAd } = require('./interstitial-ad.js');

// 判断是否已去广告
function isAdsRemoved() {
  return !!wx.getStorageSync(ADS_REMOVED_KEY);
}

// 激励广告封装
function showRewardedAd(onRewarded) {
  if (isAdsRemoved()) {
    if (typeof onRewarded === 'function') onRewarded();
    return;
  }
  loadAndShowRewardedAd(onRewarded);
}

// 插屏广告冷却计数器+展示
function showInterstitialAd() {
  if (isAdsRemoved()) return;

  let counter = wx.getStorageSync(INTERSTITIAL_COOLDOWN_KEY) || 0;
  counter++;
  if (counter >= INTERSTITIAL_COOLDOWN) {
    // 达到冷却，展示广告并重置计数
    rawShowInterstitialAd();
    wx.setStorageSync(INTERSTITIAL_COOLDOWN_KEY, 0);
  } else {
    // 未到冷却，更新计数
    wx.setStorageSync(INTERSTITIAL_COOLDOWN_KEY, counter);
  }
}

// 可选：重置插屏广告计数（如新一局开始时调用）
function resetInterstitialCounter() {
  wx.setStorageSync(INTERSTITIAL_COOLDOWN_KEY, 0);
}

module.exports = {
  isAdsRemoved,
  showRewardedAd,
  showInterstitialAd,
  resetInterstitialCounter
};