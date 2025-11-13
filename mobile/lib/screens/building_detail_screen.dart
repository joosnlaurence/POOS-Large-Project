import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'fountain_detail_screen.dart';
import '../models/user.dart';

class BuildingDetailScreen extends StatefulWidget {
  final String buildingName;
  final String buildingId;
  final User user;

  const BuildingDetailScreen({
    super.key,
    required this.buildingName,
    required this.buildingId,
    required this.user,
  });

  @override
  State<BuildingDetailScreen> createState() => _BuildingDetailScreenState();
}

class _BuildingDetailScreenState extends State<BuildingDetailScreen> {
  List<Map<String, dynamic>> fountains = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchFountains();
  }

Future<void> fetchFountains() async {
  try {
    
    // First, get the building to get its fountainIds
    final buildingResponse = await http.post(
      Uri.parse('https://4lokofridays.com/api/buildings/get'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"_id": widget.buildingId}),
    );

    if (buildingResponse.statusCode == 200) {
      final buildingData = jsonDecode(buildingResponse.body);
      
      if (buildingData['success'] == true && buildingData['building'] != null) {
        final building = buildingData['building'];
        
        final fountainIds = List<String>.from(
          (building['fountainIds'] as List?)?.map((id) => id.toString()) ?? []
        );
        

        if (fountainIds.isEmpty) {
          setState(() {
            isLoading = false;
          });
          return;
        }

        // Fetch each fountain individually
        List<Map<String, dynamic>> fetchedFountains = [];
        
        for (String fountainId in fountainIds) {
          
          final fountainResponse = await http.post(
            Uri.parse('https://4lokofridays.com/api/fountains/get'),
            headers: {"Content-Type": "application/json"},
            body: jsonEncode({"_id": fountainId}),
          );

          if (fountainResponse.statusCode == 200) {
            final fountainData = jsonDecode(fountainResponse.body);
            if (fountainData['success'] == true && fountainData['fountain'] != null) {
              fetchedFountains.add(fountainData['fountain']);
            } else {
            }
          }
        }

        setState(() {
          fountains = fetchedFountains;
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } else {
      setState(() {
        isLoading = false;
      });
    }
  } catch (e) {
    setState(() {
      isLoading = false;
    });
  }
}

  LatLng _getBuildingCoordinates(String buildingName) {
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
              // Back button
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
                      "Location: ${widget.buildingName}",
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
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.brown.shade700, // or Colors.white / Colors.grey
                      width: 3,
                    ),
                    boxShadow: [
                      BoxShadow(
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                        color: Colors.black.withOpacity(0.15),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: FlutterMap(
                      options: MapOptions(
                        initialCenter: _getBuildingCoordinates(widget.buildingName),
                        initialZoom: 19.0,
                        minZoom: 19.0,
                        maxZoom: 19.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.none,
                        ),
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
                              point: _getBuildingCoordinates(widget.buildingName),
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

              Container(
  margin: const EdgeInsets.all(16),
  height: 250,
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(
      color: Colors.brown.shade700, // or whatever outline color you like
      width: 2,
    ),
    boxShadow: [
      BoxShadow(
        blurRadius: 6,
        offset: const Offset(0, 3),
        color: Colors.black.withOpacity(0.15),
      ),
    ],
  ),
  child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Header (not scrollable)
      Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Water Fountains in:",
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
            Text(
              widget.buildingName,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      const Divider(height: 1),
      
      // Scrollable fountain list
      Expanded(
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : fountains.isEmpty
                ? const Center(child: Text("No water fountains found in this building"))
                : ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    children: fountains.map((fountain) {
                      return _buildFountainItem(
                        fountain['_id'].toString(),
                        _getFountainName(fountain),
                        _getColorFromFilter(fountain['filter']),
                        context,
                      );
                    }).toList(),
                  ),
      ),
    ],
  ),
),
            ],
          ),
        ),
      ),
    );
  }

  String _getFountainName(Map<String, dynamic> fountain) {
    final desc = fountain['location']?['description'];
    if (desc != null && desc.toString().trim().isNotEmpty) {
      return desc;
    }
    return "Water Fountain (Floor ${fountain['floor'] ?? 1})";
  }

  Color _getColorFromFilter(dynamic filter) {
    final filterStr = filter?.toString().toLowerCase() ?? '';
    switch (filterStr) {
      case 'red':
        return Colors.red;
      case 'yellow':
        return Colors.yellow;
      case 'green':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _getStatusFromColor(Color color) {
    if (color == Colors.red) return "Red";
    if (color == Colors.yellow) return "Yellow";
    if (color == Colors.green) return "Green";
    return "Unknown";
  }

Widget _buildFountainItem(String fountainId, String name, Color color, BuildContext context) {
  return Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.grey.shade50,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: Colors.grey.shade300, width: 1),
    ),
    child: Row(
      children: [
        Icon(Icons.circle, color: color, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            name,
            style: const TextStyle(fontSize: 14),
          ),
        ),
        const SizedBox(width: 8),
        // Make this a separate button
        ElevatedButton(
          onPressed: () {
            // Navigate to detail screen
            final fountain = fountains.firstWhere((f) => f['_id'].toString() == fountainId);
            final description = fountain['location']?['description'] ?? '';
            final imageUrl = fountain['imgUrl'] ?? '';
            
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => FountainDetailScreen(
                  fountainId: fountainId,
                  fountainName: name,
                  buildingName: widget.buildingName,
                  filterStatus: _getStatusFromColor(color),
                  fountainDescription: description,
                  imageUrl: imageUrl,
                ),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.lightBlue.shade100,
            foregroundColor: Colors.blue.shade900,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text(
            "More Details",
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    ),
  );
}
}
