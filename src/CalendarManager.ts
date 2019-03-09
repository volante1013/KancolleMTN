export class CalendarManager {
	private maintenanceDateStr: string; // YYYY/MM/DD
	private startDate: Date | null = null;
	private endDate: Date | null = null;
	private reminderDate: Date | null = null;
	private readonly eventTitle: string = '艦これメンテ';
	constructor(private calendarId: string, private tweetText: string) {}

	/**
	 * registerMaintenanceEvent
	 * メンテナンス日をカレンダーに登録する
	 */
	public registerMaintenanceEvent(date: string, times: string[]): string {
		const cal = CalendarApp.getCalendarById(this.calendarId);
		let result: string = '';

		// 抽出した日付と時間を整形する
		this.convertStrToDate(date, times);

		// 艦これメンテ日の予定を取得
		const maintenanceDate: Date = new Date(this.maintenanceDateStr);
		const events = cal.getEventsForDay(maintenanceDate);

		const calcReminderMin = (): number => {
			// リマインダー時刻を設定
			const reminderTime: string = PropertiesService.getScriptProperties().getProperty('REMINDER_TIME');
			this.reminderDate = new Date(this.maintenanceDateStr + ' ' + reminderTime);
			return (this.startDate.getTime() - this.reminderDate.getTime()) / (1000 * 60);
		};

		// 予定の中に「艦これメンテ」というタイトルの予定があるかどうか
		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const title: string = event.getTitle();
			console.log(`EventTitle:${title}`);
			if (title === this.eventTitle) {
				if (times === null) {
					// すでにAllDayまたは時間付きでイベントが作られている && 時間が抽出できなかった => 何もしない
					result = `NoRegisterRequired: event.Title === ${this.eventTitle} && times === null`;
				} else if (event.isAllDayEvent()) {
					// AllDayEventなら時間が設定されていないはずなので、リマインダー時間とともに設定
					event
						.setTime(this.startDate, this.endDate)
						.addPopupReminder(calcReminderMin())
						.setDescription(this.calendarId);
					result = `RegisterComplete: event.setTime(${this.startDate.toTimeString()}, ${this.endDate.toTimeString()}).addPopupReminder(${this.reminderDate.toTimeString()})`;
				} else {
					// AllDayEventでなければ時間が登録されているはずなので何もしない
					console.log('Maintenance Event is Already registered');
					result = `NoRegisterRequired: Maintenance Event is Already registered.`;
				}
				return result;
			}
		}

		if (times === null) {
			// メンテ日に'艦これメンテ'というイベントがない && 時間が抽出できなかった => AllDayでイベント作成
			cal.createAllDayEvent(this.eventTitle, maintenanceDate).setDescription(this.tweetText);
			console.log(`createAllDayEvent(${maintenanceDate.toString()})`);
			result = `RegisterComplete: createAlldayEvent(${maintenanceDate.toDateString()})`;
		} else {
			const minutesbefore = calcReminderMin();
			cal.createEvent(this.eventTitle, this.startDate, this.endDate)
				.addPopupReminder(minutesbefore)
				.setDescription(this.tweetText);
			console.log(`createEvent(reminder before ${minutesbefore} min)`);
			result = `RegisterComplete: createEvent(reminder before ${minutesbefore} min)`;
		}
		return result;
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
