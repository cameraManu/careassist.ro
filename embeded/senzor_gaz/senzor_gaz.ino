#include <Wire.h>
#include <MAX3010x.h>

// ── MQ-6 ──────────────────────────────────────
#define MQ6pin 35
#define GAZ_THRESHOLD 400

// ── MAX30100 ───────────────────────────────────
MAX30100 sensor;

#define BPM_BUFFER_SIZE 8
#define DC_ALPHA 0.95

int bpmBuffer[BPM_BUFFER_SIZE];
int bpmIndex = 0;
int bpmCount = 0;
long lastBeatTime = 0;
int bpmAfisaj = 0;
float dcFilter = 0;
int16_t filtratPrev = 0;
bool degetDetectat = false;

int calcBpmMedie() {
  int n = min(bpmCount, BPM_BUFFER_SIZE);
  if (n == 0) return 0;
  long sum = 0;
  for (int i = 0; i < n; i++) sum += bpmBuffer[i];
  return sum / n;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Wire.begin(21, 22);
  delay(100);

  Serial.println("=== Pornire sistem ===");

  // ── Initializare MAX30100 ──
  Serial.print("MAX30100... ");
  if (!sensor.begin()) {
    Serial.println("EROARE! Verifica firele.");
    while(1);
  }
  sensor.setMode(MAX30100::MODE_SPO2);
  sensor.setLedCurrent(MAX30100::LED_IR,  MAX30100::LED_CURRENT_7MA6);
  sensor.setLedCurrent(MAX30100::LED_RED, MAX30100::LED_CURRENT_7MA6);
  sensor.setSamplingRate(MAX30100::SAMPLING_RATE_100SPS);
  sensor.setResolution(MAX30100::RESOLUTION_16BIT_1600US);
  Serial.println("OK!");

  // ── Incalzire MQ-6 ──
  pinMode(MQ6pin, INPUT);
  Serial.println("MQ-6 se incalzeste 20 secunde");
  for (int i = 20; i > 0; i--) {
    Serial.print(i);
    Serial.print("s... ");
    delay(1000);
  }
  Serial.println("Gata! Sistem pornit.");
}

void loop() {
  // ── Citire MAX30100 (continuu, fara delay) ──
  auto sample = sensor.readSample(100);
  if (sample.valid) {
    uint16_t ir = sample.ir;
    degetDetectat = (ir > 3000 && ir < 60000);

    if (degetDetectat) {
      dcFilter = DC_ALPHA * dcFilter + (1.0 - DC_ALPHA) * ir;
      int16_t ac = (int16_t)ir - (int16_t)dcFilter;

      if (filtratPrev < -10 && ac >= -10) {
        long now = millis();
        long delta = now - lastBeatTime;
        if (delta > 333 && delta < 1500) {
          int bpmNou = 60000 / delta;
          bpmBuffer[bpmIndex % BPM_BUFFER_SIZE] = bpmNou;
          bpmIndex++;
          bpmCount++;
          bpmAfisaj = calcBpmMedie();
        }
        lastBeatTime = now;
      }
      filtratPrev = ac;
    } else {
      dcFilter = 0;
      filtratPrev = 0;
      bpmCount = 0;
      bpmIndex = 0;
      bpmAfisaj = 0;
      memset(bpmBuffer, 0, sizeof(bpmBuffer));
    }
  }

  // ── Afisare la fiecare 1 secunda ──
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint >= 1000) {
    lastPrint = millis();

    // Citire MQ-6
    int gazVal = analogRead(MQ6pin);

    Serial.println("╔══════════════════════════════════╗");

    // Puls
    Serial.print("║  Puls:    ");
    if (!degetDetectat) {
      Serial.println("--- (pune degetul)     ║");
    } else if (bpmAfisaj > 0) {
      Serial.print(bpmAfisaj);
      Serial.println(" BPM                   ║");
    } else {
      Serial.println("calculez...            ║");
    }

    // Gaz
    Serial.print("║  Gaz:     ");
    Serial.print(gazVal);
    if (gazVal > GAZ_THRESHOLD) {
      Serial.println("  ⚠ GAZ DETECTAT!   ║");
    } else {
      Serial.println("  (normal)          ║");
    }

    Serial.println("╚══════════════════════════════════╝");
  }
}