class StreamInfo {
  final String? channel;
  final String? feed;
  final String title;
  final String url;
  final String? referrer;
  final String? userAgent;
  final String? quality;

  StreamInfo({
    this.channel,
    this.feed,
    required this.title,
    required this.url,
    this.referrer,
    this.userAgent,
    this.quality,
  });

  factory StreamInfo.fromJson(Map<String, dynamic> json) {
    return StreamInfo(
      channel: json['channel'],
      feed: json['feed'],
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      referrer: json['referrer'],
      userAgent: json['user_agent'],
      quality: json['quality'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channel': channel,
      'feed': feed,
      'title': title,
      'url': url,
      'referrer': referrer,
      'user_agent': userAgent,
      'quality': quality,
    };
  }
}
