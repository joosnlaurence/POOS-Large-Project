import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

final dio = Dio(
  BaseOptions(
    baseUrl: "https://4lokofridays.com/api/",
    headers: {"Content-Type": "application/json", "Accept": "application/json"},
  ),
);

void setupDio() {
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: "accessToken");

        if (token != null) {
          options.headers["Authorization"] = "Bearer $token";
        }

        return handler.next(options);
      },
    ),
  );
}
