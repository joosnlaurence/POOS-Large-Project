import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../models/user.dart';
import 'login_screen.dart';
import 'building_detail_screen.dart';
import '../api/network.dart';

class HomeScreen extends StatefulWidget {
  final User user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? selectedLocation = "UCF Buildings";
  final MapController _mapController = MapController();
  
  bool isVerified = false;
  bool isLoadingVerification = true;

  final LatLng centerLocation = LatLng(28.602348, -81.200227);

  // Define multiple marker locations
  final List<Map<String, dynamic>> locations = [
    {
      "name": "Library",
      "buildingId": "691189b2327abd14645c7e56",
      "position": LatLng(28.600484146464797, -81.20139027355133),
    },
    {
      "name": "Business Administration I",
      "buildingId": "690baf85708feb38509bf882",
      "position": LatLng(28.60102222355002, -81.19911763783486),
    },
    {
      "name": "Business Administration II",
      "buildingId": "69128dc862f1038ba9f47719",
      "position": LatLng(28.600830191133735, -81.19872311456027),
    },
    {
      "name": "Engineering I",
      "buildingId": "69128d4c62f1038ba9f47718",
      "position": LatLng(28.601436313209327, -81.19837034556215),
    },
    {
      "name": "Engineering II",
      "buildingId": "690bad27708feb38509bf880",
      "position": LatLng(28.60190206587284, -81.19843927581007),
    },
    {
    "name": "L3Harris Engineering Center",
    "buildingId": "6915748bd8f8aa6afbf5aa3b",
    "position": LatLng(28.600635061589994, -81.19764841593208),  
  },
  ];

  @override
  void initState() {
    super.initState();
    fetchVerificationStatus();
  }

  Future<void> fetchVerificationStatus() async {
    try {
      final response = await dio.post(
        '/check-verification',
        data: {"email": widget.user.email},
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        setState(() {
          isVerified = response.data['isVerified'] ?? false;
          isLoadingVerification = false;
        });
      }
    } catch (err) {
      print('Error fetching verification: $err');
      setState(() {
        isVerified = false;
        isLoadingVerification = false;
      });
    }
  }

  void navigateToBuilding(
    String buildingName,
    String buildingId,
    LatLng position,
  ) {
    // Zoom to the building
    _mapController.move(position, 18.0);

    // Wait a moment for zoom animation, then navigate
    Future.delayed(const Duration(milliseconds: 500), () {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => BuildingDetailScreen(
            buildingName: buildingName,
            buildingId: buildingId,
            user: widget.user,
          ),
        ),
      );
    });
  }

  LatLng? userLocation;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: SafeArea(
          child: ListView(
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  color: Colors.cyan.shade100,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Hello ${widget.user.firstName} ${widget.user.lastName}!",
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    // Verification status badge
                    if (isLoadingVerification)
                      const CircularProgressIndicator()
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isVerified ? Colors.green : Colors.orange,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isVerified ? Icons.verified : Icons.warning,
                              color: Colors.white,
                              size: 18,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              isVerified ? "Verified" : "Not Verified",
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text("Logout"),
                onTap: () async {
                  try {
                    final resp = await dio.post("users/logout");

                    print(resp.statusCode);
                    if (resp.statusCode == 204) {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const LoginScreen(),
                        ),
                        (route) => false,
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            "Logout failed: ${resp.statusCode}",
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("Error logging out: $e"),
                      ),
                    );
                  }
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
              // Top bar
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
                  ],
                ),
              ),

              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF813B03),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFF813B03),
                    width: 2,
                  ),
                ),
                child: Center(
                  child: RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      children: [
                        TextSpan(text: "Where's "),
                        TextSpan(
                          text: "My",
                          style: TextStyle(color: Colors.lightBlue),
                        ),
                        TextSpan(
                          text: " Water?",
                          style: TextStyle(color: Colors.lightGreen),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Interactive map
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Stack(
                      children: [
                        FlutterMap(
                          mapController: _mapController,
                          options: MapOptions(
                            initialCenter: centerLocation,
                            initialZoom: 16.5,
                            minZoom: 16.0,
                            maxZoom: 19.0,
                            cameraConstraint: CameraConstraint.contain(
                              bounds: LatLngBounds(
                                LatLng(28.595, -81.210),
                                LatLng(28.610, -81.190),
                              ),
                            ),
                            onTap: (tapPosition, point) {
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
                                ...locations.map(
                                  (location) => Marker(
                                    point: location["position"],
                                    width: 40,
                                    height: 40,
                                    child: GestureDetector(
                                      onTap: () {
                                        navigateToBuilding(
                                          location["name"],
                                          location["buildingId"],
                                          location["position"],
                                        );
                                      },
                                      child: const Icon(
                                        Icons.location_pin,
                                        color: Colors.red,
                                        size: 40,
                                      ),
                                    ),
                                  ),
                                ),
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

                        // Zoom buttons overlay
                        Positioned(
                          right: 10,
                          bottom: 10,
                          child: Column(
                            children: [
                              FloatingActionButton(
                                mini: true,
                                heroTag: 'zoomIn',
                                backgroundColor: Colors.white,
                                onPressed: () {
                                  final currentZoom = _mapController.camera.zoom;
                                  _mapController.move(
                                    _mapController.camera.center,
                                    currentZoom + 1,
                                  );
                                },
                                child: const Icon(
                                  Icons.add,
                                  color: Colors.black,
                                ),
                              ),
                              const SizedBox(height: 8),
                              FloatingActionButton(
                                mini: true,
                                heroTag: 'zoomOut',
                                backgroundColor: Colors.white,
                                onPressed: () {
                                  final currentZoom = _mapController.camera.zoom;
                                  _mapController.move(
                                    _mapController.camera.center,
                                    currentZoom - 1,
                                  );
                                },
                                child: const Icon(
                                  Icons.remove,
                                  color: Colors.black,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Dropdown section
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
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.cyan,
                            width: 2,
                          ),
                        ),
                        child: DropdownButton<String>(
                          value: selectedLocation,
                          dropdownColor: Colors.white,
                          underline: Container(),
                          isExpanded: true,
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 16,
                          ),
                          icon: const Icon(
                            Icons.arrow_drop_down,
                            color: Colors.black,
                          ),
                          items: [
                            "UCF Buildings",
                            "Library",
                            "Business Administration I",
                            "Business Administration II",
                            "Engineering I",
                            "Engineering II",
                          ].map(
                            (e) {
                              return DropdownMenuItem(
                                value: e,
                                child: Text(e),
                              );
                            },
                          ).toList(),
                          onChanged: (value) {
                            if (value == selectedLocation) return;

                            setState(() {
                              selectedLocation = value;
                            });

                            // Navigate to building detail if not default
                            if (value == "UCF Buildings") {
                              _mapController.move(centerLocation, 17.0);
                            } else if (value != null) {
                              final location = locations.firstWhere(
                                (loc) => loc["name"] == value,
                              );
                              navigateToBuilding(
                                location["name"],
                                location["buildingId"],
                                location["position"],
                              );
                            }
                          },
                        ),
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
