#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

// =====================
// WiFi Credentials
// =====================
const char* ssid = "Airtel_Sirimalla";
const char* password = "Akki@2804";

// =====================
// Backend URL
// =====================
const char* serverUrl =
"https://iot-backend-248u.onrender.com/api/data";

// =====================
String serialBuffer = "";

// =====================
// SETUP
// =====================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("ESP8266 READY (SERIAL INPUT MODE)");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi CONNECTED");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  Serial.println("WAITING FOR PYTHON DATA...");
}

// =====================
// LOOP
// =====================
void loop() {
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\n' || c == '\r') {
      if (serialBuffer.length() > 0) {
        processAndSend(serialBuffer);
        serialBuffer = "";
      }
    } else {
      serialBuffer += c;
    }
  }
}

// =====================
// PROCESS & SEND
// =====================
void processAndSend(String data) {

  // Expected: HR:78,SpO2:97
  int hrPos = data.indexOf("HR:");
  int spPos = data.indexOf("SpO2:");

  if (hrPos == -1 || spPos == -1) {
    Serial.println("INVALID DATA FROM PYTHON");
    return;
  }

  int commaPos = data.indexOf(',');
  int heartRate = data.substring(hrPos + 3, commaPos).toInt();
  int spo2 = data.substring(spPos + 5).toInt();

  String json =
    "{"
    "\"heart_rate\":" + String(heartRate) + ","
    "\"spo2\":" + String(spo2) +
    "}";

  Serial.print("FROM PYTHON → ");
  Serial.println(data);
  Serial.print("SENDING → ");
  Serial.println(json);

  WiFiClientSecure client;
  client.setInsecure();  // HTTPS (Render)

  HTTPClient http;
  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(json);

  Serial.print("HTTP CODE: ");
  Serial.println(httpCode);

  http.end();
}
