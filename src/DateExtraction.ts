export class DateExtraction {
	constructor(private tweetText: string) {}

	/**
	 * extractMaintenanceDate
	 * ツイートからメンテナンス日を抽出する
	 */
	public extractMaintenanceDate(): string {
		const dataRegArray: RegExpMatchArray = this.tweetText.match(/[0-9]+\/[0-9]+/g);
		if (dataRegArray === null) {
			return null;
		}
		console.log(dataRegArray);
		return dataRegArray[0]; // とりあえず最初にマッチした文字列だけを返す
	}

	/**
	 * extractMaintenanceTime
	 * ツイートからメンテナンス時間(開始と終了)を抽出する
	 */
	public extractMaintenanceTime(): string[] {
		const timeRegArray: RegExpMatchArray = this.tweetText.match(/[0-9]+:[0-9]+/g);
		//TBD: 抽出できた時間が1つや3つ以上あるとき
		if (timeRegArray === null || timeRegArray.length !== 2) {
			// ツイートに時間がないとき または 抽出した時間が2つでないとき
			console.log(timeRegArray === null ? 'No match time in tweet' : 'Matched time string is over 2');
			return null;
		}
		// ツイートに時間があるとき
		console.log(timeRegArray);
		return timeRegArray;
	}
}
