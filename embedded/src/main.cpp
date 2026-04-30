#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  Serial.println("CareAssist ESP32 bootstrap");
}

void loop() {
  // TODO: read sensors and send JSON payload via WiFi REST API.
  delay(10000);
}
