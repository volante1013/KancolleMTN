import { TweetMonitor } from './tweetmonitor';
import { DateExtraction } from './DateExtraction';
import { CalendarManager } from './CalendarManager';
declare var global: any;

global.doPost = (e): void => {
	const jsonString: string = e.postData.getDataAsString();
	const data = JSON.parse(jsonString);
	const tweetText: string = data.text;
	// const tweetText: string =
	// '次回の「艦これ」稼働全サーバ群メンテナンス＆アップデートは、今週金曜日【2/8(金)】実施を予定しています。同開始時間は【11:00】、作業完了時間は【20:30】を予定しています。提督の皆さん、本件ご留意頂けますと幸いです。';
	console.log(tweetText);

	// ツイートからメンテナンスの日付と時間を抽出
	const ext = new DateExtraction(tweetText);
	const date: string = ext.extractMaintenanceDate();
	const time: string[] = ext.extractMaintenanceTime();

	// メンテナンスを予定として指定したカレンダーに登録
	const calendarID: string = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
	const cm: CalendarManager = new CalendarManager(calendarID);
};

// global.monitorKanColleTweet = (): void => {
//   // prettier-ignore
//   const consumerKey: string = PropertiesService.getScriptProperties().getProperty('TW_CONSUMER_KEY');
//   // prettier-ignore
//   const consumerSecret: string = PropertiesService.getScriptProperties().getProperty('TW_CONSUMER_SECRET');
//   const tm = new TweetMonitor(consumerKey, consumerSecret);

//   // prettier-ignore
//   const newestTweetId: string = PropertiesService.getScriptProperties().getProperty('TW_NEWEST_TWEETID');
//   const tweets = tm.getUserTimeline('KanColle_STAFF', newestTweetId);
// };
