class ChannelLogo {
  final String channel;
  final String? feed;
  final List<String> tags;
  final int width;
  final int height;
  final String? format;
  final String url;

  ChannelLogo({
    required this.channel,
    this.feed,
    this.tags = const [],
    required this.width,
    required this.height,
    this.format,
    required this.url,
  });

  factory ChannelLogo.fromJson(Map<String, dynamic> json) {
    return ChannelLogo(
      channel: json['channel'] ?? '',
      feed: json['feed'],
      tags: json['tags'] != null ? List<String>.from(json['tags']) : [],
      width: json['width'] ?? 0,
      height: json['height'] ?? 0,
      format: json['format'],
      url: json['url'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channel': channel,
      'feed': feed,
      'tags': tags,
      'width': width,
      'height': height,
      'format': format,
      'url': url,
    };
  }
}
