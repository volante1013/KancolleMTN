export class CalendarManager {
	private maintenanceDateStr: string; // YYYY/MM/DD
	private startDate: Date | null = null;
	private endDate: Date | null = null;
	private reminderDate: Date | null = null;
	private readonly eventTitle: string = '艦これメンテ';
	constructor(private calendarId: string, private tweetText: string) {}

	/**
	 * registerMaintenanceEvent
	 * メンテナンス日時をカレンダーに登録する
	 */
	public registerMaintenanceEvent(date: string, times: string[]): string {
		const cal = CalendarApp.getCalendarById(this.calendarId);
		let result: string = '';

		// 抽出した日付と時間を整形する
		this.convertStrToDate(date, times);

		// 艦これメンテ日の予定を取得
		const maintenanceDate: Date = new Date(this.maintenanceDateStr);
		const events = cal.getEventsForDay(maintenanceDate);

		// 予定の中に「艦これメンテ」というタイトルの予定があるかどうか
		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const title: string = event.getTitle();
			if (title !== this.eventTitle) {
				continue;
			}

			if (times === null) {
				// すでにAllDayまたは時間付きでイベントが作られている && 時間が抽出できなかった => 何もしない
				result = `NoRegisterRequired: event.Title === ${this.eventTitle} && times === null`;
			} else if (event.isAllDayEvent()) {
				// AllDayEventなら時間が設定されていないはずなので、リマインダー時間とともに設定
				event
					.setTime(this.startDate, this.endDate)
					.setDescription(this.tweetText)
					.removeAllReminders()
					.addPopupReminder(this.calcReminderMin());
				result = `RegisterComplete: event.setTime(${this.startDate.toTimeString()}, ${this.endDate.toTimeString()}).addPopupReminder(${this.reminderDate.toTimeString()})`;
			} else {
				// AllDayEventでなければ時間が登録されているはずなので何もしない
				result = `NoRegisterRequired: Maintenance Event is Already registered.`;
			}
			return result;
		}

		if (times === null) {
			// メンテ日に'艦これメンテ'というイベントがない && 時間が抽出できなかった => AllDayでイベント作成
			cal.createAllDayEvent(this.eventTitle, maintenanceDate)
				.setDescription(this.tweetText)
				.removeAllReminders()
				.addPopupReminder(30); // 時間が取得できなかったときはデフォルトで30分前にメールじゃない通知をする。
			result = `RegisterComplete: createAlldayEvent(${maintenanceDate.toDateString()})`;
		} else {
			const minutesbefore = this.calcReminderMin();
			cal.createEvent(this.eventTitle, this.startDate, this.endDate)
				.setDescription(this.tweetText)
				.removeAllReminders()
				.addPopupReminder(minutesbefore);
			result = `RegisterComplete: createEvent(reminder before ${minutesbefore} min)`;
		}
		return result;
	}

	/**
	 * registerMaintenanceEventForNoDate
	 * ツイートから日付は抽出できなかったが、時間は抽出できたときに
	 * メンテナンス日時をカレンダーに登録する
	 */
	public registerMaintenanceEventForNoDate(times: string[]): string {
		const cal = CalendarApp.getCalendarById(this.calendarId);
		let result: string = '';

		const now = new Date();
		const fourDaysLater = new Date(now.getTime());
		fourDaysLater.setDate(now.getDate() + 4);
		const events = cal.getEvents(now, fourDaysLater, {
			search: `${this.eventTitle}`
		});

		if (events.length <= 0) {
			// 何もしない
			result = 'NoRegisterRequired: No Date and No event between 4 days later.';
			return result;
		}

		for (let index = 0; index < events.length; index++) {
			const event = events[index];
			const title: string = event.getTitle();
			if (title !== this.eventTitle) {
				continue;
			}

			// TBD: 日付のツイートが過去になく、突然「明日」や「3日後」の〇〇時にメンテが行われるという旨のツイートへの対応
			if (event.isAllDayEvent()) {
				// 当てはまったeventの日時を取得してstartDateとendDateを設定
				const startDate = event.getAllDayStartDate();
				this.convertStrToDate(`${startDate.getMonth() + 1}/${startDate.getDate()}`, times);

				// AllDayEventなら時間が設定されていないはずなので、リマインダー時間とともに設定
				event
					.setTime(this.startDate, this.endDate)
					.setDescription(this.tweetText)
					.removeAllReminders()
					.addPopupReminder(this.calcReminderMin());
				result = `RegisterComplete: event.setTime(${this.startDate.toTimeString()}, ${this.endDate.toTimeString()}).addPopupReminder(${this.reminderDate.toTimeString()})`;
			} else {
				// AllDayEventでなければ時間が登録されているはずなので何もしない
				console.log('Maintenance Event is Already registered');
				result = `NoRegisterRequired: Maintenance Event is Already registered.`;
			}
			break;
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
			return;
		}

		// TBD: 時間が終了->開始の順番で抽出されたときの挙動
		const startDateStr: string = this.maintenanceDateStr + ' ' + times[0];
		const endDateStr: string = this.maintenanceDateStr + ' ' + times[1];
		this.startDate = new Date(startDateStr);
		this.endDate = new Date(endDateStr);
		console.log(`ExtStartTime:${this.startDate.toString()} ExtEndTime:${this.endDate.toString()}`);
	}

	/**
	 * calcReminderMin
	 * リマインダーをする時間が何分前かを計算する
	 */
	private calcReminderMin = (): number => {
		// リマインダー時刻を設定
		const reminderTime: string = PropertiesService.getScriptProperties().getProperty('REMINDER_TIME');
		this.reminderDate = new Date(this.maintenanceDateStr + ' ' + reminderTime);
		return (this.startDate.getTime() - this.reminderDate.getTime()) / (1000 * 60);
	};
}
