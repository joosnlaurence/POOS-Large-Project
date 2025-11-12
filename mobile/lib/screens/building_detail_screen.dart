import 'package:flutter/material.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class BuildingDetailScreen extends StatelessWidget {
  final String buildingName;

  const BuildingDetailScreen({super.key, required this.buildingName});

  LatLng _getBuildingCoordinates(String buildingName) {
  // Map building names to coordinates
  final Map<String, LatLng> coordinates = {
    "Library": LatLng(28.600484146464797, -81.20139027355133),
    "Business Administration I": LatLng(28.601167, -81.199083),
    "Business Administration II": LatLng(28.600917, -81.198583),
    "Engineering I": LatLng(28.601478, -81.198306),
    "Engineering II": LatLng(28.602035, -81.198334),
  };
  
  return coordinates[buildingName] ?? LatLng(28.602348, -81.200227);
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
              // Back button and header
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      label: const Text("Back", style: TextStyle(color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.cyan,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Brown box with building info
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF813B03),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                        children: [
                          TextSpan(text: "Where's ", style: TextStyle(color: Colors.white)),
                          TextSpan(text: "My ", style: TextStyle(color: Colors.lightBlue)),
                          TextSpan(text: "Water?", style: TextStyle(color: Colors.lightGreen)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Location: $buildingName",
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),

              // Map of the building area
Expanded(
  child: Container(
    margin: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(12),
    ),
    child: ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: FlutterMap(
        options: MapOptions(
          initialCenter: _getBuildingCoordinates(buildingName),
          initialZoom: 19.0,  // Very zoomed in
          minZoom: 18.0,
          maxZoom: 20.0,
        ),
        children: [
          TileLayer(
            urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            subdomains: const ['a', 'b', 'c'],
            userAgentPackageName: 'com.example.mobile',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: _getBuildingCoordinates(buildingName),
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.location_pin,
                  color: Colors.red,
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

              // Water fountains list
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Water Fountains in:",
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    Text(
                      buildingName,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    _buildFountainItem("Water Fountain 1", Colors.red),
                    _buildFountainItem("Water Fountain 2", Colors.yellow),
                    _buildFountainItem("Water Fountain 3", Colors.green),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFountainItem(String name, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(Icons.circle, color: color, size: 20),
          const SizedBox(width: 8),
          Text(name, style: const TextStyle(fontSize: 14)),
          const Spacer(),
          const Text(
            "Select for More Details",
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
