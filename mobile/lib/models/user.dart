class User {
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String token;
  final bool isVerified;

  User({
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    required this.token,
    required this.isVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      username: json['user'] ?? json['username'] ?? '',
      email: json['email'] ?? '',
      token: json['token'] ?? '',
      isVerified: json['isVerified'] ?? false,
    );
  }
}
