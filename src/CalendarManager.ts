export class CalendarManager {
	constructor(private calendarId: string) {}

	public registerMaintenanceEvent() {
		const cal = CalendarApp.getCalendarById(this.calendarId);
	}
}
