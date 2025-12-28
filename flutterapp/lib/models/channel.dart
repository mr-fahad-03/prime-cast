class Channel {
  final String id;
  final String name;
  final List<String> altNames;
  final String? network;
  final List<String> owners;
  final String country;
  final List<String> categories;
  final bool isNsfw;
  final String? launched;
  final String? closed;
  final String? replacedBy;
  final String? website;

  Channel({
    required this.id,
    required this.name,
    this.altNames = const [],
    this.network,
    this.owners = const [],
    required this.country,
    this.categories = const [],
    this.isNsfw = false,
    this.launched,
    this.closed,
    this.replacedBy,
    this.website,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      altNames: json['alt_names'] != null
          ? List<String>.from(json['alt_names'])
          : [],
      network: json['network'],
      owners: json['owners'] != null ? List<String>.from(json['owners']) : [],
      country: json['country'] ?? '',
      categories: json['categories'] != null
          ? List<String>.from(json['categories'])
          : [],
      isNsfw: json['is_nsfw'] ?? false,
      launched: json['launched'],
      closed: json['closed'],
      replacedBy: json['replaced_by'],
      website: json['website'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'alt_names': altNames,
      'network': network,
      'owners': owners,
      'country': country,
      'categories': categories,
      'is_nsfw': isNsfw,
      'launched': launched,
      'closed': closed,
      'replaced_by': replacedBy,
      'website': website,
    };
  }

  bool get isAvailable => closed == null && !isNsfw;
}
