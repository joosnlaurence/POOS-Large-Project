import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
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
  final MapController _mapController = MapController();
  
  // Center locations from your React code
  final LatLng centerLocation = LatLng(28.602348, -81.200227);
  final LatLng markerLocation = LatLng(28.600484146464797, -81.20139027355133);
  
  LatLng? userLocation;

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
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text("Logout"),
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
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("assets/tile.png"),
            fit: BoxFit.cover,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              /// Top bar
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
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.brown.shade600,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.brown.shade800, width: 2),
                        ),
                        child: Center(
                          child: RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                              children: [
                                TextSpan(text: "Where's "),
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

              /// INTERACTIVE MAP
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: centerLocation,
                        initialZoom: 17.0,
                        onTap: (tapPosition, point) {
                          // User tapped on map - you can add location functionality here
                          setState(() {
                            userLocation = point;
                          });
                        },
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                          subdomains: const ['a', 'b', 'c'],
                          userAgentPackageName: 'com.example.mobile',
                        ),
                        MarkerLayer(
                          markers: [
                            // Fixed marker from your React code
                            Marker(
                              point: markerLocation,
                              width: 40,
                              height: 40,
                              child: const Icon(
                                Icons.location_pin,
                                color: Colors.red,
                                size: 40,
                              ),
                            ),
                            // User location marker (if set)
                            if (userLocation != null)
                              Marker(
                                point: userLocation!,
                                width: 40,
                                height: 40,
                                child: const Icon(
                                  Icons.my_location,
                                  color: Colors.blue,
                                  size: 40,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              /// Location dropdown
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.cyan,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.teal, width: 3),
                  ),
                  child: Column(
                    children: [
                      const Text(
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
