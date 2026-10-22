/**
 * Curated blocklists of Ad Networks, Trackers, Telemetry, and Crypto Miners
 * Based on EasyList, EasyPrivacy, and Brave's built-in blocklists.
 */

const AD_DOMAINS = new Set([
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'adnxs.com',
  'criteo.com',
  'criteo.net',
  'taboola.com',
  'outbrain.com',
  'pubmatic.com',
  'rubiconproject.com',
  'adroll.com',
  'amazon-adsystem.com',
  'ads-twitter.com',
  'advertising.com',
  'popads.net',
  'propellerads.com',
  'zedo.com',
  'revcontent.com',
  'mgid.com',
  'bidswitch.net',
  'casalemedia.com',
  'openx.net',
  'smartadserver.com',
  'yieldmo.com',
  'adblade.com',
  'adtechus.com',
  'moatads.com',
  'inmobi.com',
  'applovin.com',
  'unityads.unity3d.com',
  'media.net',
  'sovrn.com',
  'indexexchange.com',
  'triplelift.com',
  'teads.tv',
  'sharethrough.com',
  'undertone.com',
  'exponential.com',
  'conversantmedia.com',
  'nativo.com',
  'adcolony.com',
  'vungle.com',
  'chartboost.com',
  'ironsrc.com',
  'smaato.net',
  'admob.com',
  'adtrue.com'
]);

const TRACKER_DOMAINS = new Set([
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'hotjar.com',
  'mixpanel.com',
  'segment.io',
  'segment.com',
  'amplitude.com',
  'fullstory.com',
  'crazyegg.com',
  'clarity.ms',
  'pixel.facebook.com',
  'analytics.facebook.com',
  'connect.facebook.net',
  'analytics.twitter.com',
  'quantserve.com',
  'chartbeat.com',
  'optimizely.com',
  'branch.io',
  'appsflyer.com',
  'adjust.com',
  'krxd.net',
  'bluekai.com',
  'scorecardresearch.com',
  'imrworldwide.com',
  'statcounter.com',
  'newrelic.com',
  'mouseflow.com',
  'luckyorange.net',
  'inspectlet.com',
  'clicky.com',
  'heap.io',
  'kissmetrics.io',
  'kissmetrics.com',
  'parsely.com',
  'matomo.org',
  'yandex.ru/metrika',
  'mc.yandex.ru'
]);

const CRYPTO_MINER_DOMAINS = new Set([
  'coinhive.com',
  'coin-hive.com',
  'crypto-loot.com',
  'webminepool.com',
  'jsecoin.com',
  'authedmine.com',
  'minr.pw',
  'mataharirama.xyz'
]);

const PATH_PATTERNS = [
  /\/gtm\.js(\?|$)/i,
  /\/analytics\.js(\?|$)/i,
  /\/fbevents\.js(\?|$)/i,
  /\/adsystem\//i,
  /\/ads\/(banner|promo|sponsored)/i,
  /\/pagead\/js\/adsbygoogle\.js/i,
  /\/google-analytics\.com\/ga\.js/i,
  /\/beacon\.min\.js/i,
  /\/telemetry(\.min)?\.js/i,
  /\/tracker(\.min)?\.js/i,
  /\/coinhive(\.min)?\.js/i
];

export {
  AD_DOMAINS,
  TRACKER_DOMAINS,
  CRYPTO_MINER_DOMAINS,
  PATH_PATTERNS
};

export default {
  AD_DOMAINS,
  TRACKER_DOMAINS,
  CRYPTO_MINER_DOMAINS,
  PATH_PATTERNS
};
