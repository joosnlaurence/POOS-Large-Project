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
      onError: (err, handler) async {
        if ((err.response?.statusCode == 401 || err.response?.statusCode == 403) &&
            !err.requestOptions.extra.containsKey("refreshAttempt")) {

          try {
            err.requestOptions.extra["refreshAttempt"] = true;
            print(err.response?.statusCode);
            final refreshToken = await storage.read(key: "refreshToken");
            print(refreshToken);
            final refreshResp = await dio.post(
              "users/refresh",
              data: {"refreshToken": refreshToken},
              options: Options(
                headers: {"Content-Type": "application/json"},
              ),
            );

            final newToken = refreshResp.data["accessToken"];
            if (newToken == null) {
              return handler.reject(err);
            }
            await storage.write(key: "accessToken", value: newToken);
            final clonedReq = await _retryRequest(err.requestOptions, newToken);

            return handler.resolve(clonedReq);
          } catch (e) {
            // Refresh failed user must log in again
            return handler.reject(err);
          }
        }
        return handler.next(err);
      },
    ),
  );
}

Future<Response> _retryRequest(RequestOptions requestOptions, String token) async {
  final newOptions = Options(
    method: requestOptions.method,
    headers: {
      ...requestOptions.headers,
      "Authorization": "Bearer $token",
    },
    extra: {
      ...requestOptions.extra,
      "refreshAttempt": true,
    },
  );

  return dio.request(
    requestOptions.path,
    data: requestOptions.data,
    queryParameters: requestOptions.queryParameters,
    options: newOptions,
  );
}
