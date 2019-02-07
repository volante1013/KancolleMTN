import { TweetMonitor } from './tweetmonitor';
declare var global: any;

global.monitorKanColleTweet = (): void => {
  // prettier-ignore
  const consumerKey: string = PropertiesService.getScriptProperties().getProperty('TW_CONSUMER_KEY');
  // prettier-ignore
  const consumerSecret: string = PropertiesService.getScriptProperties().getProperty('TW_CONSUMER_SECRET');
  const tm = new TweetMonitor(consumerKey, consumerSecret);

  // prettier-ignore
  const newestTweetId: string = PropertiesService.getScriptProperties().getProperty('TW_NEWEST_TWEETID');
  const tweets = tm.getUserTimeline('KanColle_STAFF', newestTweetId);
};
