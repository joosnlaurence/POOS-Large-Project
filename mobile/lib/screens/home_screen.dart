import 'package:flutter/material.dart';
import '../models/user.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  final User user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? selectedLocation = "UCF Building";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: SafeArea(
          child: ListView(
            children: [
              DrawerHeader(
                child: Center(
                  child: Text(
                    "Hello ${widget.user.firstName} ${widget.user.lastName}!",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              ListTile(
                leading: Icon(Icons.logout),
                title: Text("Logout"),
                onTap: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                },
              ),
            ],
          ),
        ),
      ),

      body: Container(
        width: double.infinity,
        height: double.infinity,

        /// ✅ gold tile background
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/tile.png"),
            fit: BoxFit.cover,
          ),
        ),

        child: SafeArea(
          child: Column(
            children: [
              /// ✅ top bar w/ hamburger + logo
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(
                  children: [
                    Builder(
                      builder: (context) => IconButton(
                        icon: const Icon(Icons.menu, size: 32),
                        onPressed: () => Scaffold.of(context).openDrawer(),
                      ),
                    ),
                    Expanded(
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.brown.shade600,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.brown.shade800, width: 2),
                        ),
                        child: Center(
                          child: RichText(
                            text: TextSpan(
                              style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                              children: [
                                TextSpan(text: "Where’s "),
                                TextSpan(
                                  text: "My",
                                  style: TextStyle(color: Colors.greenAccent),
                                ),
                                TextSpan(
                                  text: " Water?",
                                  style: TextStyle(color: Colors.lightBlueAccent),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              /// ✅ MAP IMAGE
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: double.infinity,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),

              /// ✅ Location dropdown box
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.cyan,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.teal, width: 3),
                  ),
                  child: Column(
                    children: [
                      Text(
                        "Select Your Location",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      DropdownButton<String>(
                        value: selectedLocation,
                        dropdownColor: Colors.white,
                        items: [
                          "UCF Building",
                          "Classroom",
                          "Dorm",
                          "Business",
                        ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedLocation = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
