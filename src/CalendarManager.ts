export class CalendarManager {
	private maintenanceDateStr: string; // YYYY/MM/DD
	private startDate: Date | null = null;
	private endDate: Date | null = null;
	private reminderDate: Date | null = null;
	private readonly eventTitle: string = '艦これメンテ';
	constructor(private calendarId: string) {}

	/**
	 * registerMaintenanceEvent
	 * メンテナンス日をカレンダーに登録する
	 */
	public registerMaintenanceEvent(date: string, times: string[]) {
		// 抽出した日付と時間を整形する
		this.convertStrToDate(date, times);

		const cal = CalendarApp.getCalendarById(this.calendarId);

		// 艦これメンテ日の予定を取得
		const maintenanceDate: Date = new Date(this.maintenanceDateStr);
		const events = cal.getEventsForDay(maintenanceDate);

		// リマインダー時刻を設定
		const reminderTime: string = PropertiesService.getScriptProperties().getProperty('REMINDER_TIME');
		this.reminderDate = new Date(this.maintenanceDateStr + ' ' + reminderTime);
		const minutesbefore = (this.startDate.getTime() - this.reminderDate.getTime()) / (1000 * 60);

		// 予定の中に「艦これメンテ」というタイトルの予定があるかどうか
		for (let index = 0; index < events.length; index++) {
			const event = events[index];

			const title: string = event.getTitle();
			console.log(`EventTitle:${title}`);
			if (title !== this.eventTitle) {
				continue;
			}

			// メンテ日に'艦これメンテ'というイベントがない && 時間が抽出できなかった => AllDayでイベント作成
			if (times === null) {
				cal.createAllDayEvent(this.eventTitle, maintenanceDate);
				console.log(`createAllDayEvent[${maintenanceDate.toString()}]`);
				return;
			}

			// あればその開始時間と終了時間を取得
			let startTime = event.getStartTime();
			let endTime = event.getEndTime();
			console.log(`StartTime:${startTime.toString()} EndTime:${endTime.toString()}`);

			// 開始時間と終了時間がなければ抽出した時間を登録
			if (startTime.getTime() !== this.startDate.getTime() || endTime.getTime() !== this.endDate.getTime()) {
				event.setTime(this.startDate, this.endDate).addPopupReminder(minutesbefore);
			} else {
				console.log('Maintenance Event is Already registered');
			}
			return;
		}

		// 予定自体がなければその予定を新規作成する
		cal.createEvent(this.eventTitle, this.startDate, this.endDate).addPopupReminder(minutesbefore);
		console.log(`createEvent[reminder before ${minutesbefore} min]`);
	}

	/**
	 * formatStartAndEndDate
	 * 抽出した日付と時間をDateに変換する
	 */
	private convertStrToDate(date: string, times: string[]) {
		const now = new Date();
		this.maintenanceDateStr = now.getFullYear().toString() + '/' + date;

		if (times === null) {
			console.log('times === null');
			return;
		}

		// TBD: 時間が終了->開始の順番で抽出されたときの挙動
		const startDateStr: string = this.maintenanceDateStr + ' ' + times[0];
		const endDateStr: string = this.maintenanceDateStr + ' ' + times[1];
		this.startDate = new Date(startDateStr);
		this.endDate = new Date(endDateStr);
		console.log(`ExtStartTime:${this.startDate.toString()} ExtEndTime:${this.endDate.toString()}`);
	}
}
