import 'package:flutter/material.dart';
import '../models/user.dart';
import 'login_screen.dart';

class HomeScreen extends StatelessWidget {
  final User user;

  const HomeScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Welcome, ${user.firstName}"),
        backgroundColor: Colors.green,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () {
              // Optional: clear token/session here if stored

              // Navigate back to login screen and remove this page from stack
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
                (route) => false, // removes all previous routes
              );
            },
          )
        ],
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Hello ${user.firstName} ${user.lastName}!",
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text("Username: ${user.username}", style: const TextStyle(fontSize: 18)),
            Text("Email: ${user.email}", style: const TextStyle(fontSize: 18)),
          ],
        ),
      ),
    );
  }
}
