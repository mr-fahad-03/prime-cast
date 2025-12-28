import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';
import '../utils/constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  // ==================== IPTV APIs ====================

  /// Get all countries
  Future<ApiResponse<List<Country>>> getCountries() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.countriesEndpoint),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final countries = data.map((c) => Country.fromJson(c)).toList();
        countries.sort((a, b) => a.name.compareTo(b.name));
        return ApiResponse.success(countries);
      }
      return ApiResponse.error('Failed to load countries');
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  /// Get all channels
  Future<ApiResponse<List<Channel>>> getChannels() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.channelsEndpoint),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final channels = data.map((c) => Channel.fromJson(c)).toList();
        return ApiResponse.success(channels);
      }
      return ApiResponse.error('Failed to load channels');
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  /// Get channels for a specific country
  Future<ApiResponse<List<Channel>>> getChannelsByCountry(String countryCode) async {
    try {
      final channelsResult = await getChannels();
      if (!channelsResult.isSuccess) {
        return channelsResult;
      }

      final streamsResult = await getStreams();
      if (!streamsResult.isSuccess) {
        return ApiResponse.error(streamsResult.error ?? 'Failed to load streams');
      }

      // Get channel IDs that have streams
      final channelIdsWithStreams = streamsResult.data!
          .where((s) => s.channel != null)
          .map((s) => s.channel)
          .toSet();

      // Filter channels by country, exclude closed/NSFW, and only include those with streams
      final filteredChannels = channelsResult.data!
          .where((ch) =>
              ch.country == countryCode &&
              ch.isAvailable &&
              channelIdsWithStreams.contains(ch.id))
          .toList();

      filteredChannels.sort((a, b) => a.name.compareTo(b.name));
      return ApiResponse.success(filteredChannels);
    } catch (e) {
      return ApiResponse.error('Error: ${e.toString()}');
    }
  }

  /// Get all streams
  Future<ApiResponse<List<StreamInfo>>> getStreams() async {
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.streamsEndpoint),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final streams = data.map((s) => StreamInfo.fromJson(s)).toList();
        return ApiResponse.success(streams);
      }
      return ApiResponse.error('Failed to load streams');
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  /// Get streams for a specific channel
  Future<ApiResponse<List<StreamInfo>>> getStreamsByChannel(String channelId) async {
    try {
      final result = await getStreams();
      if (!result.isSuccess) return result;

      final channelStreams =
          result.data!.where((s) => s.channel == channelId).toList();
      return ApiResponse.success(channelStreams);
    } catch (e) {
      return ApiResponse.error('Error: ${e.toString()}');
    }
  }

  // Cache for all logos
  static List<ChannelLogo>? _logosCache;
  static bool _loadingLogos = false;

  /// Get all logos (with caching)
  Future<ApiResponse<List<ChannelLogo>>> getLogos() async {
    // Return cached data if available
    if (_logosCache != null) {
      return ApiResponse.success(_logosCache!);
    }
    
    // Prevent multiple simultaneous requests
    if (_loadingLogos) {
      await Future.delayed(const Duration(milliseconds: 500));
      if (_logosCache != null) {
        return ApiResponse.success(_logosCache!);
      }
    }
    
    _loadingLogos = true;
    
    try {
      final response = await http.get(
        Uri.parse(ApiConstants.logosEndpoint),
      ).timeout(
        const Duration(seconds: 60),
        onTimeout: () {
          throw Exception('Logos request timeout');
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final logos = data.map((l) => ChannelLogo.fromJson(l)).toList();
        _logosCache = logos;
        _loadingLogos = false;
        return ApiResponse.success(logos);
      }
      _loadingLogos = false;
      return ApiResponse.error('Failed to load logos');
    } catch (e) {
      _loadingLogos = false;
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }
  
  /// Get logos filtered for specific channels (more efficient)
  Future<ApiResponse<Map<String, String>>> getLogosForChannels(Set<String> channelIds) async {
    try {
      final result = await getLogos();
      if (!result.isSuccess || result.data == null) {
        return ApiResponse.error(result.error ?? 'Failed to load logos');
      }
      
      final logoMap = <String, String>{};
      for (var logo in result.data!) {
        if (channelIds.contains(logo.channel) && logo.url.isNotEmpty) {
          logoMap[logo.channel] = logo.url;
        }
      }
      
      return ApiResponse.success(logoMap);
    } catch (e) {
      return ApiResponse.error('Error: ${e.toString()}');
    }
  }

  /// Get logo for a specific channel
  Future<String?> getChannelLogo(String channelId) async {
    try {
      final result = await getLogos();
      if (!result.isSuccess) return null;

      final logo = result.data!.firstWhere(
        (l) => l.channel == channelId,
        orElse: () => ChannelLogo(channel: '', width: 0, height: 0, url: ''),
      );
      return logo.url.isNotEmpty ? logo.url : null;
    } catch (e) {
      return null;
    }
  }
}

/// Generic API response wrapper
class ApiResponse<T> {
  final bool isSuccess;
  final T? data;
  final String? error;
  final String? message;

  ApiResponse._({
    required this.isSuccess,
    this.data,
    this.error,
    this.message,
  });

  factory ApiResponse.success(T data, {String? message}) {
    return ApiResponse._(
      isSuccess: true,
      data: data,
      message: message,
    );
  }

  factory ApiResponse.error(String error) {
    return ApiResponse._(
      isSuccess: false,
      error: error,
    );
  }
}
