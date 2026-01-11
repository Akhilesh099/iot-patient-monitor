#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API URL
const char* serverUrl = "http://YOUR_PC_IP_ADDRESS:5000/api/vitals";

// Fake Sensor Data Variables
int heartRate = 75;
int spo2 = 98;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // SIMULATE SENSOR READING
  // In real project, read from MAX30100/MAX30102 sensor here
  heartRate = random(70, 90); 
  spo2 = random(96, 100);

  // Check WiFi connection status
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    
    // Prepare JSON payload
    StaticJsonDocument<200> doc;
    doc["heart_rate"] = heartRate;
    doc["spo2"] = spo2;
    doc["timestamp"] = millis();
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    // Send HTTP POST request
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int intoResponseCode = http.POST(requestBody);
    
    if(intoResponseCode > 0){
      String response = http.getString();
      Serial.println(intoResponseCode);
      Serial.println(response);
    }else{
      Serial.print("Error on sending POST: ");
      Serial.println(intoResponseCode);
    }
    
    http.end();
  }else{
    Serial.println("Error in WiFi connection");
  }
  
  // Send data every 1 second
  delay(1000);
}
