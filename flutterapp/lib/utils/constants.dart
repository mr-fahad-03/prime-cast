class ApiConstants {
  // IPTV API endpoints (external)
  static const String iptvBaseUrl = 'https://iptv-org.github.io/api';
  static const String countriesEndpoint = '$iptvBaseUrl/countries.json';
  static const String channelsEndpoint = '$iptvBaseUrl/channels.json';
  static const String streamsEndpoint = '$iptvBaseUrl/streams.json';
  static const String logosEndpoint = '$iptvBaseUrl/logos.json';
}

class AppStrings {
  static const String appName = 'PrimeCast';
  static const String tagline = 'Watch Live TV From Around the World';
  static const String channelCount = '10,000+';
  
  // Home strings
  static const String watchNow = 'Watch Now';
  static const String liveChannels = 'Live Channels Available';
  static const String selectCountry = 'Select Country';
  static const String selectChannel = 'Select Channel';
  static const String search = 'Search...';
  static const String noChannels = 'No channels available';
  static const String loadingChannels = 'Loading channels...';
  
  // Error strings
  static const String somethingWrong = 'Something went wrong. Please try again.';
}

