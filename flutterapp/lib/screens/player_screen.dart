import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:screen_brightness/screen_brightness.dart';
import '../models/models.dart';
import '../utils/app_theme.dart';

class PlayerScreen extends StatefulWidget {
  final Channel channel;
  final List<StreamInfo> streams;
  final String? logoUrl;

  const PlayerScreen({
    super.key,
    required this.channel,
    required this.streams,
    this.logoUrl,
  });

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  VideoPlayerController? _videoController;
  int _currentStreamIndex = 0;
  bool _isLoading = true;
  String? _error;
  bool _showControls = true;
  bool _isFullscreen = false;
  
  // Gesture control variables
  double _currentVolume = 1.0;
  double _currentBrightness = 0.5;
  bool _showVolumeIndicator = false;
  bool _showBrightnessIndicator = false;
  bool _showSeekIndicator = false;
  int _seekSeconds = 0;
  double _dragStartY = 0;
  double _dragStartX = 0;

  @override
  void initState() {
    super.initState();
    _initializeBrightness();
    _initializePlayer();
  }
  
  Future<void> _initializeBrightness() async {
    try {
      _currentBrightness = await ScreenBrightness().current;
    } catch (_) {
      _currentBrightness = 0.5;
    }
  }

  @override
  void dispose() {
    _resetBrightness();
    _disposePlayer();
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
    super.dispose();
  }
  
  Future<void> _resetBrightness() async {
    try {
      await ScreenBrightness().resetScreenBrightness();
    } catch (_) {}
  }

  void _disposePlayer() {
    _videoController?.dispose();
    _videoController = null;
  }

  Future<void> _initializePlayer() async {
    if (widget.streams.isEmpty) {
      setState(() {
        _error = 'No streams available for this channel';
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    _disposePlayer();

    try {
      final stream = widget.streams[_currentStreamIndex];
      
      debugPrint('Trying stream: ${stream.url}');
      
      _videoController = VideoPlayerController.networkUrl(
        Uri.parse(stream.url),
        httpHeaders: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        },
      );

      _videoController!.addListener(_videoListener);

      await _videoController!.initialize().timeout(
        const Duration(seconds: 20),
        onTimeout: () {
          throw Exception('Connection timeout');
        },
      );

      _currentVolume = _videoController!.value.volume;
      await _videoController!.play();

      setState(() {
        _isLoading = false;
      });

      // Auto-hide controls after 3 seconds
      _startControlsTimer();
    } catch (e) {
      debugPrint('Stream error: $e');
      
      // Auto-try next stream if available
      if (_currentStreamIndex < widget.streams.length - 1) {
        _currentStreamIndex++;
        _initializePlayer();
        return;
      }
      
      String errorMsg = 'Stream unavailable';
      final errorStr = e.toString().toLowerCase();
      if (errorStr.contains('timeout')) {
        errorMsg = 'Connection timeout';
      } else if (errorStr.contains('source') || errorStr.contains('exoplayer')) {
        errorMsg = 'Stream unavailable or geo-restricted';
      } else if (errorStr.contains('network') || errorStr.contains('socket')) {
        errorMsg = 'Network error - check connection';
      }
      
      setState(() {
        _error = errorMsg;
        _isLoading = false;
      });
    }
  }

  void _videoListener() {
    if (_videoController == null) return;
    
    if (_videoController!.value.hasError) {
      setState(() {
        _error = 'Playback error';
        _isLoading = false;
      });
    }
  }

  void _startControlsTimer() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _videoController != null && _videoController!.value.isPlaying) {
        setState(() {
          _showControls = false;
        });
      }
    });
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
    if (_showControls) {
      _startControlsTimer();
    }
  }

  void _tryNextStream() {
    if (_currentStreamIndex < widget.streams.length - 1) {
      setState(() {
        _currentStreamIndex++;
      });
      _initializePlayer();
    } else {
      setState(() {
        _currentStreamIndex = 0;
      });
      _initializePlayer();
    }
  }

  void _toggleFullscreen() {
    setState(() {
      _isFullscreen = !_isFullscreen;
    });
    
    if (_isFullscreen) {
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
      ]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    } else {
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    }
  }

  void _togglePlayPause() {
    if (_videoController == null) return;
    
    setState(() {
      if (_videoController!.value.isPlaying) {
        _videoController!.pause();
      } else {
        _videoController!.play();
        _startControlsTimer();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        top: !_isFullscreen,
        bottom: !_isFullscreen,
        left: false,
        right: false,
        child: _isFullscreen ? _buildFullscreenLayout() : _buildPortraitLayout(),
      ),
    );
  }

  Widget _buildPortraitLayout() {
    return Column(
      children: [
        _buildHeader(),
        AspectRatio(
          aspectRatio: 16 / 9,
          child: _buildVideoPlayerWithGestures(),
        ),
        if (widget.streams.length > 1) _buildStreamSelector(),
        Expanded(child: _buildChannelInfo()),
      ],
    );
  }

  Widget _buildFullscreenLayout() {
    return _buildVideoPlayerWithGestures();
  }

  Widget _buildVideoPlayerWithGestures() {
    return GestureDetector(
      onTap: _toggleControls,
      onDoubleTapDown: (details) {
        final screenWidth = MediaQuery.of(context).size.width;
        final tapX = details.globalPosition.dx;
        
        if (tapX < screenWidth / 3) {
          _seekRelative(-10);
        } else if (tapX > screenWidth * 2 / 3) {
          _seekRelative(10);
        } else {
          _togglePlayPause();
        }
      },
      onVerticalDragStart: (details) {
        _dragStartY = details.globalPosition.dy;
        _dragStartX = details.globalPosition.dx;
      },
      onVerticalDragUpdate: (details) {
        final screenWidth = MediaQuery.of(context).size.width;
        final delta = _dragStartY - details.globalPosition.dy;
        final change = delta / 150;
        
        if (_dragStartX < screenWidth / 2) {
          _adjustBrightness(change);
        } else {
          _adjustVolume(change);
        }
        _dragStartY = details.globalPosition.dy;
      },
      onVerticalDragEnd: (_) {
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            setState(() {
              _showVolumeIndicator = false;
              _showBrightnessIndicator = false;
            });
          }
        });
      },
      onHorizontalDragStart: (details) {
        _dragStartX = details.globalPosition.dx;
        _seekSeconds = 0;
      },
      onHorizontalDragUpdate: (details) {
        final delta = details.globalPosition.dx - _dragStartX;
        final seekChange = (delta / 3).round();
        if (seekChange != _seekSeconds) {
          setState(() {
            _seekSeconds = seekChange;
            _showSeekIndicator = true;
          });
        }
      },
      onHorizontalDragEnd: (_) {
        if (_seekSeconds != 0) {
          _seekRelative(_seekSeconds);
        }
        setState(() {
          _showSeekIndicator = false;
          _seekSeconds = 0;
        });
      },
      child: Container(
        color: Colors.black,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Video or loading/error state
            _buildVideoContent(),
            
            // Gesture indicators
            if (_showVolumeIndicator) _buildVolumeIndicator(),
            if (_showBrightnessIndicator) _buildBrightnessIndicator(),
            if (_showSeekIndicator) _buildSeekIndicator(),
            
            // Controls overlay
            if (_showControls && !_isLoading && _error == null) _buildControlsOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoContent() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text('Loading stream...', style: TextStyle(color: Colors.white70)),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.white)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: _initializePlayer,
                  child: const Text('Retry'),
                ),
                if (widget.streams.length > 1) ...[
                  const SizedBox(width: 12),
                  OutlinedButton(
                    onPressed: _tryNextStream,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white54),
                    ),
                    child: const Text('Try Next'),
                  ),
                ],
              ],
            ),
          ],
        ),
      );
    }

    if (_videoController != null && _videoController!.value.isInitialized) {
      return Center(
        child: AspectRatio(
          aspectRatio: _videoController!.value.aspectRatio,
          child: VideoPlayer(_videoController!),
        ),
      );
    }

    return const SizedBox();
  }

  Widget _buildControlsOverlay() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withOpacity(0.7),
            Colors.transparent,
            Colors.transparent,
            Colors.black.withOpacity(0.7),
          ],
          stops: const [0.0, 0.2, 0.8, 1.0],
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Top bar
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    if (_isFullscreen) {
                      _toggleFullscreen();
                    } else {
                      Navigator.pop(context, _error != null ? false : true);
                    }
                  },
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                ),
                Expanded(
                  child: Text(
                    widget.channel.name,
                    style: const TextStyle(color: Colors.white, fontSize: 16),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (widget.streams.length > 1)
                  IconButton(
                    onPressed: _tryNextStream,
                    icon: const Icon(Icons.skip_next, color: Colors.white),
                  ),
              ],
            ),
          ),
          
          // Center play/pause button
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildControlButton(
                icon: Icons.replay_10,
                onTap: () => _seekRelative(-10),
              ),
              const SizedBox(width: 32),
              _buildControlButton(
                icon: _videoController?.value.isPlaying == true 
                    ? Icons.pause 
                    : Icons.play_arrow,
                onTap: _togglePlayPause,
                size: 64,
              ),
              const SizedBox(width: 32),
              _buildControlButton(
                icon: Icons.forward_10,
                onTap: () => _seekRelative(10),
              ),
            ],
          ),
          
          // Bottom bar with progress and fullscreen
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              children: [
                // Progress bar
                if (_videoController != null && _videoController!.value.isInitialized)
                  VideoProgressIndicator(
                    _videoController!,
                    allowScrubbing: true,
                    colors: const VideoProgressColors(
                      playedColor: AppColors.primary,
                      bufferedColor: Colors.white38,
                      backgroundColor: Colors.white24,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                  ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Duration
                    if (_videoController != null && _videoController!.value.isInitialized)
                      Text(
                        '${_formatDuration(_videoController!.value.position)} / ${_formatDuration(_videoController!.value.duration)}',
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      )
                    else
                      const Text('LIVE', style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                    
                    // Fullscreen button
                    IconButton(
                      onPressed: _toggleFullscreen,
                      icon: Icon(
                        _isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({required IconData icon, required VoidCallback onTap, double size = 48}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.5),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: size * 0.6),
      ),
    );
  }

  Widget _buildVolumeIndicator() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _currentVolume > 0.5 ? Icons.volume_up : _currentVolume > 0 ? Icons.volume_down : Icons.volume_off,
              color: Colors.white,
              size: 40,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: 120,
              child: LinearProgressIndicator(
                value: _currentVolume,
                backgroundColor: Colors.white24,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${(_currentVolume * 100).round()}%',
              style: const TextStyle(color: Colors.white, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBrightnessIndicator() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _currentBrightness > 0.5 ? Icons.brightness_high : Icons.brightness_low,
              color: Colors.white,
              size: 40,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: 120,
              child: LinearProgressIndicator(
                value: _currentBrightness,
                backgroundColor: Colors.white24,
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.yellow),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${(_currentBrightness * 100).round()}%',
              style: const TextStyle(color: Colors.white, fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSeekIndicator() {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _seekSeconds >= 0 ? Icons.fast_forward : Icons.fast_rewind,
              color: Colors.white,
              size: 28,
            ),
            const SizedBox(width: 12),
            Text(
              '${_seekSeconds >= 0 ? '+' : ''}${_seekSeconds}s',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _adjustVolume(double change) {
    setState(() {
      _currentVolume = (_currentVolume + change).clamp(0.0, 1.0);
      _showVolumeIndicator = true;
      _showBrightnessIndicator = false;
    });
    _videoController?.setVolume(_currentVolume);
  }
  
  void _adjustBrightness(double change) async {
    setState(() {
      _currentBrightness = (_currentBrightness + change).clamp(0.0, 1.0);
      _showBrightnessIndicator = true;
      _showVolumeIndicator = false;
    });
    try {
      await ScreenBrightness().setScreenBrightness(_currentBrightness);
    } catch (_) {}
  }
  
  void _seekRelative(int seconds) {
    if (_videoController == null || !_videoController!.value.isInitialized) return;
    
    final currentPosition = _videoController!.value.position;
    final duration = _videoController!.value.duration;
    final newPosition = currentPosition + Duration(seconds: seconds);
    
    final clampedPosition = Duration(
      milliseconds: newPosition.inMilliseconds.clamp(0, duration.inMilliseconds),
    );
    
    _videoController!.seekTo(clampedPosition);
    
    setState(() {
      _showSeekIndicator = true;
      _seekSeconds = seconds;
    });
    
    Future.delayed(const Duration(milliseconds: 700), () {
      if (mounted) {
        setState(() {
          _showSeekIndicator = false;
        });
      }
    });
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}';
    }
    return '${twoDigits(minutes)}:${twoDigits(seconds)}';
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(12),
      color: AppColors.background,
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context, _error != null ? false : true),
            icon: const Icon(Icons.arrow_back, color: Colors.white),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.channel.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (widget.streams.length > 1)
                  Text(
                    'Stream ${_currentStreamIndex + 1} of ${widget.streams.length}',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
              ],
            ),
          ),
          if (widget.streams.length > 1)
            IconButton(
              onPressed: _tryNextStream,
              icon: const Icon(Icons.skip_next, color: Colors.white),
            ),
        ],
      ),
    );
  }

  Widget _buildStreamSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      color: AppColors.background,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: List.generate(widget.streams.length, (index) {
            final stream = widget.streams[index];
            final isSelected = index == _currentStreamIndex;
            
            return GestureDetector(
              onTap: () {
                if (index != _currentStreamIndex) {
                  setState(() {
                    _currentStreamIndex = index;
                  });
                  _initializePlayer();
                }
              },
              child: Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : Colors.white.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.play_circle_outline,
                      size: 16,
                      color: isSelected ? Colors.white : Colors.white70,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      stream.quality ?? 'Stream ${index + 1}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildChannelInfo() {
    return Container(
      color: AppColors.background,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.channel.categories.isNotEmpty) ...[
              const Text(
                'Categories',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: widget.channel.categories.map((cat) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                    ),
                    child: Text(cat, style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
            ],
            if (widget.channel.network != null) ...[
              _buildInfoRow('Network', widget.channel.network!),
              const SizedBox(height: 12),
            ],
            _buildInfoRow('Country', widget.channel.country),
            if (widget.channel.launched != null) ...[
              const SizedBox(height: 12),
              _buildInfoRow('Launched', widget.channel.launched!),
            ],
            const SizedBox(height: 24),
            const Text(
              'Current Stream',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.streams[_currentStreamIndex].title,
                    style: const TextStyle(color: Colors.white),
                  ),
                  if (widget.streams[_currentStreamIndex].quality != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Quality: ${widget.streams[_currentStreamIndex].quality}',
                      style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 80,
          child: Text(label, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5))),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(fontSize: 14, color: Colors.white)),
        ),
      ],
    );
  }
}
