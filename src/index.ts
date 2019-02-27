import { DateExtraction } from './DateExtraction';
import { CalendarManager } from './CalendarManager';
declare var global: any;

global.doPost = (e): void => {
	const jsonString: string = e.postData.getDataAsString();
	const data = JSON.parse(jsonString);
	const tweetText: string = data.text;
	// const tweetText: string =
	// 	'「艦これ」次回稼働全サーバ群メンテナンス＆アップデートを、明日【2/27(水) 11:00】より実施予定です。同作業完了は、【20:00】を予定しています。提督の皆さん、お手数をお掛けします。ご協力、どうぞよろしくお願い致します！\n#艦これ';
	console.log(tweetText);

	// ツイートからメンテナンスの日付と時間を抽出
	const ext = new DateExtraction(tweetText);
	const date: string = ext.extractMaintenanceDate();
	const times: string[] = ext.extractMaintenanceTime();
	if (date === null) {
		console.log('date === null');
		return;
	}

	// メンテナンスを予定として指定したカレンダーに登録
	const calendarID: string = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
	const cm: CalendarManager = new CalendarManager(calendarID);
	cm.registerMaintenanceEvent(date, times);
};
