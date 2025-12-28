import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/models.dart';
import '../services/api_service.dart';
import '../utils/app_theme.dart';
import 'player_screen.dart';

class ChannelsScreen extends StatefulWidget {
  final Country country;

  const ChannelsScreen({super.key, required this.country});

  @override
  State<ChannelsScreen> createState() => _ChannelsScreenState();
}

class _ChannelsScreenState extends State<ChannelsScreen> {
  List<Channel> _channels = [];
  List<Channel> _filteredChannels = [];
  Map<String, String> _channelLogos = {};
  Map<String, List<StreamInfo>> _channelStreams = {};
  Map<String, StreamStatus> _streamStatus = {};
  bool _isLoading = true;
  String? _error;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadChannelsData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadChannelsData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load channels and streams first
      final results = await Future.wait([
        ApiService().getChannelsByCountry(widget.country.code),
        ApiService().getStreams(),
      ]);

      final channelsResult = results[0] as ApiResponse<List<Channel>>;
      final streamsResult = results[1] as ApiResponse<List<StreamInfo>>;

      if (channelsResult.isSuccess && channelsResult.data != null) {
        _channels = channelsResult.data!;
        _filteredChannels = _channels;
      }

      if (streamsResult.isSuccess && streamsResult.data != null) {
        for (var stream in streamsResult.data!) {
          final channelId = stream.channel;
          if (channelId == null || channelId.isEmpty) continue;
          if (!_channelStreams.containsKey(channelId)) {
            _channelStreams[channelId] = [];
          }
          _channelStreams[channelId]!.add(stream);
        }
      }

      setState(() {
        _isLoading = false;
      });

      // Load logos DIRECTLY from API for this country's channels only
      _loadLogosDirectly();
      
      // Check stream availability in background
      _checkStreamAvailability();
    } catch (e) {
      setState(() {
        _error = 'Failed to load channels: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadLogosDirectly() async {
    try {
      // Fetch logos JSON directly
      final response = await http.get(
        Uri.parse('https://iptv-org.github.io/api/logos.json'),
      ).timeout(const Duration(seconds: 30));
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final channelIds = _channels.map((c) => c.id).toSet();
        final logoMap = <String, String>{};
        
        for (var item in data) {
          final channel = item['channel'] as String?;
          final url = item['url'] as String?;
          if (channel != null && url != null && channelIds.contains(channel) && url.isNotEmpty) {
            // Only take first logo for each channel
            if (!logoMap.containsKey(channel)) {
              logoMap[channel] = url;
            }
          }
        }
        
        debugPrint('LOGOS: Found ${logoMap.length} logos for ${_channels.length} channels');
        
        if (mounted) {
          setState(() {
            _channelLogos = logoMap;
          });
        }
      }
    } catch (e) {
      debugPrint('Failed to load logos: $e');
    }
  }

  Future<void> _checkStreamAvailability() async {
    // First pass - mark all channels with their initial status
    for (var channel in _channels) {
      final streams = _channelStreams[channel.id] ?? [];
      if (streams.isEmpty) {
        if (mounted) {
          setState(() {
            _streamStatus[channel.id] = StreamStatus.noStreams;
          });
        }
      } else {
        // Mark as checking initially
        if (mounted) {
          setState(() {
            _streamStatus[channel.id] = StreamStatus.checking;
          });
        }
      }
    }
    
    // Second pass - verify each stream in background (5 at a time for speed)
    final channelsWithStreams = _channels.where((c) => (_channelStreams[c.id] ?? []).isNotEmpty).toList();
    
    for (int i = 0; i < channelsWithStreams.length; i += 5) {
      final batch = channelsWithStreams.skip(i).take(5).toList();
      await Future.wait(batch.map((channel) => _verifyChannelStream(channel)));
    }
  }

  Future<void> _verifyChannelStream(Channel channel) async {
    final streams = _channelStreams[channel.id] ?? [];
    if (streams.isEmpty) return;
    
    // Try each stream until one works
    for (var stream in streams) {
      final status = await _checkStreamUrl(stream.url);
      if (status == StreamStatus.live) {
        if (mounted) {
          setState(() {
            _streamStatus[channel.id] = StreamStatus.live;
          });
        }
        return;
      }
    }
    
    // All streams failed
    if (mounted) {
      setState(() {
        _streamStatus[channel.id] = StreamStatus.offline;
      });
    }
  }

  Future<StreamStatus> _checkStreamUrl(String url) async {
    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
        },
      ).timeout(const Duration(seconds: 8));
      
      if (response.statusCode == 200) {
        final contentType = response.headers['content-type'] ?? '';
        final body = response.body;
        
        // Check if it's a valid HLS/M3U8 playlist
        if (body.contains('#EXTM3U') || 
            body.contains('#EXT-X') || 
            contentType.contains('mpegurl') ||
            contentType.contains('x-mpegURL')) {
          return StreamStatus.live;
        }
        
        // If response is binary (video data), it's likely working
        if (response.bodyBytes.length > 1000 && !body.contains('<!DOCTYPE') && !body.contains('<html')) {
          return StreamStatus.live;
        }
        
        return StreamStatus.offline;
      } else if (response.statusCode == 403 || response.statusCode == 404 || response.statusCode == 451) {
        return StreamStatus.offline;
      }
      return StreamStatus.offline;
    } catch (e) {
      return StreamStatus.offline;
    }
  }

  void _filterChannels(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredChannels = _channels;
      } else {
        _filteredChannels = _channels.where((c) {
          return c.name.toLowerCase().contains(query.toLowerCase()) ||
              c.altNames.any((n) => n.toLowerCase().contains(query.toLowerCase()));
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppGradients.gradientBackground,
        child: SafeArea(
          child: Column(
            children: [
              _buildAppBar(),
              _buildSearchBar(),
              Expanded(child: _buildContent()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back, color: Colors.white),
          ),
          const SizedBox(width: 8),
          // Country flag
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: Image.network(
              widget.country.flagUrl,
              width: 32,
              height: 24,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const Icon(Icons.flag, color: Colors.white30, size: 24),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.country.name,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${_filteredChannels.length} channels',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(color: Colors.white),
        onChanged: _filterChannels,
        decoration: InputDecoration(
          hintText: 'Search channels...',
          hintStyle: const TextStyle(color: AppColors.textMuted),
          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: AppColors.textMuted),
                  onPressed: () {
                    _searchController.clear();
                    _filterChannels('');
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white.withOpacity(0.1),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text('Loading channels...', style: TextStyle(color: Colors.white70)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(_error!, style: const TextStyle(color: AppColors.error), textAlign: TextAlign.center),
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadChannelsData, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (_filteredChannels.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.tv_off, size: 64, color: Colors.white.withOpacity(0.5)),
            const SizedBox(height: 16),
            Text('No channels available', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 16)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadChannelsData,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _filteredChannels.length,
        itemBuilder: (context, index) {
          final channel = _filteredChannels[index];
          final streams = _channelStreams[channel.id] ?? [];
          final status = _streamStatus[channel.id] ?? StreamStatus.checking;
          return _buildChannelCard(channel, streams, status);
        },
      ),
    );
  }

  Widget _buildChannelCard(Channel channel, List<StreamInfo> streams, StreamStatus status) {
    final hasStreams = streams.isNotEmpty;
    final logoUrl = _channelLogos[channel.id];
    final canPlay = status == StreamStatus.live || status == StreamStatus.hasStreams;

    return GestureDetector(
      onTap: hasStreams
          ? () async {
              // Navigate to player
              final result = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (_) => PlayerScreen(
                    channel: channel,
                    streams: streams,
                    logoUrl: logoUrl,
                  ),
                ),
              );
              
              // Update status based on playback result
              if (mounted) {
                if (result == true) {
                  setState(() {
                    _streamStatus[channel.id] = StreamStatus.live;
                  });
                } else if (result == false) {
                  setState(() {
                    _streamStatus[channel.id] = StreamStatus.offline;
                  });
                }
              }
            }
          : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            // Channel logo with status indicator
            Stack(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.all(4),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: _buildLogo(channel.name, logoUrl),
                  ),
                ),
                // Status indicator
                Positioned(
                  right: -2,
                  bottom: -2,
                  child: _buildStatusIndicator(status),
                ),
              ],
            ),
            const SizedBox(width: 16),
            // Channel info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    channel.name,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (channel.categories.isNotEmpty)
                    Wrap(
                      spacing: 6,
                      children: channel.categories.take(2).map((cat) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(cat, style: const TextStyle(fontSize: 10, color: AppColors.primary)),
                        );
                      }).toList(),
                    ),
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: _buildStatusText(status, streams.length),
                  ),
                ],
              ),
            ),
            // Play button
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: canPlay ? AppColors.primary : status == StreamStatus.offline ? Colors.red.withOpacity(0.3) : Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                canPlay ? Icons.play_arrow : status == StreamStatus.offline ? Icons.block : Icons.remove,
                color: canPlay ? Colors.white : Colors.white30,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogo(String channelName, String? logoUrl) {
    if (logoUrl != null && logoUrl.isNotEmpty) {
      return Image.network(
        logoUrl,
        fit: BoxFit.contain,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return _buildInitials(channelName);
        },
        errorBuilder: (context, error, stackTrace) {
          return _buildInitials(channelName);
        },
      );
    }
    return _buildInitials(channelName);
  }

  Widget _buildInitials(String name) {
    final initials = name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(StreamStatus status) {
    Color color;
    IconData icon;
    
    switch (status) {
      case StreamStatus.live:
        color = Colors.green;
        icon = Icons.check;
        break;
      case StreamStatus.offline:
        color = Colors.red;
        icon = Icons.close;
        break;
      case StreamStatus.noStreams:
        color = Colors.grey;
        icon = Icons.remove;
        break;
      case StreamStatus.hasStreams:
        color = Colors.blue;
        icon = Icons.play_arrow;
        break;
      case StreamStatus.checking:
        return Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            color: Colors.orange,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.background, width: 2),
          ),
          child: const Padding(
            padding: EdgeInsets.all(3),
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          ),
        );
    }
    
    return Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.background, width: 2),
        boxShadow: status == StreamStatus.live ? [
          BoxShadow(color: Colors.green.withOpacity(0.5), blurRadius: 4, spreadRadius: 1),
        ] : null,
      ),
      child: Icon(icon, color: Colors.white, size: 10),
    );
  }

  Widget _buildStatusText(StreamStatus status, int streamCount) {
    String text;
    Color color;

    switch (status) {
      case StreamStatus.live:
        text = '● LIVE • $streamCount stream${streamCount > 1 ? 's' : ''}';
        color = Colors.green;
        break;
      case StreamStatus.offline:
        text = '○ Unavailable';
        color = Colors.red.shade300;
        break;
      case StreamStatus.noStreams:
        text = 'No streams';
        color = Colors.grey;
        break;
      case StreamStatus.checking:
        text = 'Loading...';
        color = Colors.orange;
        break;
      case StreamStatus.hasStreams:
        text = '${streamCount} stream${streamCount > 1 ? 's' : ''} available';
        color = Colors.blue;
        break;
    }

    return Text(
      text,
      style: TextStyle(fontSize: 12, color: color, fontWeight: status == StreamStatus.live ? FontWeight.w600 : FontWeight.normal),
    );
  }
}

enum StreamStatus { checking, live, offline, noStreams, hasStreams }
