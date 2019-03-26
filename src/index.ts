import { DateExtraction } from './DateExtraction';
import { CalendarManager } from './CalendarManager';
declare var global: any;

global.doPost = (e): GoogleAppsScript.Content.TextOutput => {
	const jsonString: string = e.postData.getDataAsString();
	const data = JSON.parse(jsonString);
	const tweetText: string = data.text;
	console.log(tweetText);

	let result = { message: '' };

	// ツイートからメンテナンスの日付と時間を抽出
	const ext = new DateExtraction(tweetText);
	const date: string | null = ext.extractMaintenanceDate();
	const times: string[] | null = ext.extractMaintenanceTime();
	if (date === null && times === null) {
		result.message = 'NoRegisterRequired: date === null && times === null';
	} else {
		// メンテナンスを予定として指定したカレンダーに登録
		const calendarID: string = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID');
		const cm: CalendarManager = new CalendarManager(calendarID, tweetText);
		console.log(`date === ${date} && times === ${times}`);
		if (date === null && times !== null) {
			result.message = cm.registerMaintenanceEventForNoDate(times);
		} else {
			result.message = cm.registerMaintenanceEvent(date, times);
		}
	}

	// 結果を返す
	console.log(result.message);
	return /* ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON) */;
};
