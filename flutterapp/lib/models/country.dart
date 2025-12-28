class Country {
  final String name;
  final String code;
  final List<String> languages;
  final String? flag;

  Country({
    required this.name,
    required this.code,
    this.languages = const [],
    this.flag,
  });

  factory Country.fromJson(Map<String, dynamic> json) {
    return Country(
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      languages: json['languages'] != null
          ? List<String>.from(json['languages'])
          : [],
      flag: json['flag'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'code': code,
      'languages': languages,
      'flag': flag,
    };
  }

  String get flagUrl => 'https://flagcdn.com/w80/${code.toLowerCase()}.png';
}
