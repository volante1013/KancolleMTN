export class TweetMonitor {
  private tokenUrl: string = 'https://api.twitter.com/oauth2/token';
  private token: string;
  constructor(consumerKey: string, consumerSecret: string) {
    const tokenCredential: string = Utilities.base64EncodeWebSafe(consumerKey + ':' + consumerSecret);
    const tokenOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      headers: {
        Authorization: 'Basic ' + tokenCredential,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      method: 'post',
      payload: 'grant_type=client_credentials'
    };
    const responseToken = UrlFetchApp.fetch(this.tokenUrl, tokenOptions);
    const parsedToken = JSON.parse(responseToken.getContentText());
    this.token = parsedToken.access_token;
  }

  private apiUserTimelineUrl =
    'https://api.twitter.com/1.1/statuses/user_timeline.json?include_rts=false&exclude_replies=true&';
  getUserTimeline(screenName: string, id: string): string {
    const apiUrl = this.apiUserTimelineUrl + 'screen_name=' + screenName + '&since_id=' + id;
    const apiOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      headers: { Authorization: 'Bearer ' + this.token },
      method: 'get'
    };
    const responseApi = UrlFetchApp.fetch(apiUrl, apiOptions);

    // バリデーション
    if (responseApi.getResponseCode() !== 200) {
      console.error(`Response Code ( = ${responseApi.getResponseCode()}) !== 200.`);
      return '';
    }
    const tweets = JSON.parse(responseApi.getContentText());
    if (tweets === undefined) {
      console.error('tweets === undefined');
      return '';
    }
    console.log(tweets);
    Logger.log(tweets);
    PropertiesService.getScriptProperties().setProperty('TW_NEWEST_TWEETID', tweets[0].id_str);

    let result = '';
    for (let i = 0; i < tweets.length; i++) {
      const tweet: string = tweets[i].text;
      if (tweet.indexOf('メンテ') < 0) continue;

      console.info(tweet);
    }

    return tweets as string;
  }
}
