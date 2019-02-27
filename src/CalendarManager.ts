export class CalendarManager {
	private maintenanceDateStr: string; // YYYY/MM/DD
	private startDate: Date = null;
	private endDate: Date = null;
	private reminderDate: Date = null;
	private readonly eventTitle: string = '艦これメンテ';
	constructor(private calendarId: string) {}

	public registerMaintenanceEvent(date: string, times: string[]) {
		// 抽出した日付と時間を整形する
		this.formatStartAndEndDate(date, times);

		const cal = CalendarApp.getCalendarById(this.calendarId);

		// 艦これメンテ日の予定を取得
		const maintenanceDate: Date = new Date(this.maintenanceDateStr);
		const events = cal.getEventsForDay(maintenanceDate);

		// リマインダー時刻を設定
		this.reminderDate = new Date(this.maintenanceDateStr + ' 6:50');
		const minutesbefore = (this.startDate.getTime() - this.reminderDate.getTime()) / (1000 * 60);

		// 予定の中に「艦これメンテ」というタイトルの予定があるかどうか
		for (let index = 0; index < events.length; index++) {
			const event = events[index];

			const title: string = event.getTitle();
			console.log('EventTitle => ' + title);
			if (title !== this.eventTitle) {
				continue;
			}

			if (times === null) {
				return;
			}

			// あればその開始時間と終了時間を取得
			let startTime = event.getStartTime();
			console.log('開始時間 => ' + startTime.toString());
			let endTime = event.getEndTime();
			console.log('終了時間 => ' + endTime.toString());

			// 開始時間と終了時間がなければ抽出した時間を登録
			if (startTime.getTime() !== this.startDate.getTime() || endTime.getTime() !== this.endDate.getTime()) {
				event.setTime(this.startDate, this.endDate).addPopupReminder(minutesbefore);
			} else {
				console.log('登録済み');
			}
			return;
		}

		// 予定自体がなければその予定を新規作成する
		if (times === null) {
			cal.createAllDayEvent(this.eventTitle, maintenanceDate);
		} else {
			cal.createEvent(this.eventTitle, this.startDate, this.endDate).addPopupReminder(minutesbefore);
		}
	}

	private formatStartAndEndDate(date: string, times: string[]) {
		const now = new Date();
		this.maintenanceDateStr = now.getFullYear().toString() + '/' + date;

		if (times === null) {
			console.log('times === null');
			return;
		}

		const startDateStr: string = this.maintenanceDateStr + ' ' + times[0];
		const endDateStr: string = this.maintenanceDateStr + ' ' + times[1];
		this.startDate = new Date(startDateStr);
		this.endDate = new Date(endDateStr);
		console.log('抽出した開始時間 => ' + this.startDate.toString() + ' 抽出した終了時間 => ' + this.endDate.toString());
	}

	public testCalander() {
		const cal = CalendarApp.getCalendarById(this.calendarId);
		const events = cal.getEventsForDay(new Date('2019/2/8(金)'));
		events.forEach(event => {
			console.log(event.getTitle());
			if (event.getTitle() === '艦これメンテ') {
				console.log(event.getStartTime().getHours() + ':' + event.getStartTime().getMinutes());
				console.log(event.getEndTime().getHours() + ':' + event.getEndTime().getMinutes());
				event.setTime(new Date('2019/2/8 11:00'), new Date('2019/2/8 20:30'));
			}
		});

		cal.createEvent('艦これメンテ', new Date('2019/2/8 11:00'), new Date('2019/2/8 20:30')).addPopupReminder(300);
	}
}
