import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api/network.dart';

class FountainDetailScreen extends StatefulWidget {
  final String fountainId;
  final String fountainName;
  final String buildingName;
  final String filterStatus;
  final String fountainDescription;
  final String imageUrl;

  const FountainDetailScreen({
    super.key,
    required this.fountainId,
    required this.fountainName,
    required this.buildingName,
    required this.filterStatus,
    required this.fountainDescription,
    required this.imageUrl,
  });

  @override
  State<FountainDetailScreen> createState() => _FountainDetailScreenState();
}

class _FountainDetailScreenState extends State<FountainDetailScreen> {
  String? selectedFilterColor;
  bool isSubmitting = false;

  Future<void> submitVote() async {
    if (selectedFilterColor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a filter color")),
      );
      return;
    }

    setState(() => isSubmitting = true);
    print(widget.fountainId);
    print(selectedFilterColor);
    try {
      final response = await dio.post(
        'votes/add',
        data: {
          "fountainId": widget.fountainId,
          "rating": selectedFilterColor!.toLowerCase(),
        },
      );
      print(response.statusCode);

      setState(() => isSubmitting = false);

      if (response.statusCode == 200) {
        final data = response.data;
        if (data['success'] == true) {
          if (!mounted) return;
          
          String message = data['updatedVote'] == true 
              ? "Vote updated successfully!"
              : "Vote submitted successfully!";
          
          if (data['filterChanged'] == true) {
            message += "\nFilter color changed to ${data['newFilterColor']}!";
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Colors.green,
            ),
          );

          // Go back to building screen to see updated color
          Navigator.pop(context);
        } else {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error: ${data['error']}")),
          );
        }
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${response.statusCode}")),
        );
      }
    } catch (err) {
      setState(() => isSubmitting = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $err")),
      );
    }
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
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Back button
                Padding(
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

                // Header
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF813B03),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: RichText(
                    text: const TextSpan(
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                      children: [
                        TextSpan(text: "Where's ", style: TextStyle(color: Colors.white)),
                        TextSpan(text: "My ", style: TextStyle(color: Colors.lightGreen)),
                        TextSpan(text: "Water?", style: TextStyle(color: Colors.lightBlue)),
                      ],
                    ),
                  ),
                ),

// Fountain Image
Container(
  margin: const EdgeInsets.all(16),
  height: 300,
  decoration: BoxDecoration(
    color: Colors.grey.shade300,
    borderRadius: BorderRadius.circular(12),
  ),
  child: widget.imageUrl.isNotEmpty
      ? ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            widget.imageUrl,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return Center(
                child: CircularProgressIndicator(
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                      : null,
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              return const Center(
                child: Text(
                  "Image not available",
                  style: TextStyle(fontSize: 16),
                ),
              );
            },
          ),
        )
      : const Center(
          child: Text(
            "No image available",
            style: TextStyle(fontSize: 16),
          ),
        ),
),
                // Details Box
Container(
  margin: const EdgeInsets.all(16),
  padding: const EdgeInsets.all(20),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text(
        "Location",
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
      Text(
        widget.buildingName,
        style: const TextStyle(color: Colors.grey),
      ),
      const SizedBox(height: 4),
      Text(
        widget.fountainDescription,  // Add description here
        style: const TextStyle(color: Colors.grey, fontSize: 14),
      ),
      const SizedBox(height: 16),
      
      const Text(
        "Current Filter Status",
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      ),
                      Text(
                        widget.filterStatus,
                        style: TextStyle(
                          color: _getFilterColor(widget.filterStatus),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      const Text(
                        "Change Filter Status",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      
                      Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              value: selectedFilterColor,
                              decoration: const InputDecoration(
                                labelText: "Filter Status Colors",
                                border: OutlineInputBorder(),
                              ),
                              items: const [
                                DropdownMenuItem(value: "Red", child: Text("Red")),
                                DropdownMenuItem(value: "Yellow", child: Text("Yellow")),
                                DropdownMenuItem(value: "Green", child: Text("Green")),
                              ],
                              onChanged: (value) {
                                setState(() {
                                  selectedFilterColor = value;
                                });
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: isSubmitting ? null : submitVote,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.cyan,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            ),
                            child: isSubmitting
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text(
                                    "Submit",
                                    style: TextStyle(color: Colors.white),
                                  ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getFilterColor(String status) {
    switch (status.toLowerCase()) {
      case 'red':
        return Colors.red;
      case 'yellow':
        return Colors.yellow.shade700;
      case 'green':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
