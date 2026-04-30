REPER PROIECT: CareAssist.ro (Teleasistență AAL)
🛠️ Stivă Tehnologică Obligatorie
Backend: Node.js (Application Logic).  

Web Frontend: React cu TypeScript (Single Page Application).  

Mobile Frontend: React Native (Cross-platform).  

Bază de Date: MariaDB / MySQL.  

Embedded: ESP32 programat în C++ (Arduino IDE/FreeRTOS).  

🏗️ Arhitectură și Comunicare
Model: Three-tier (Domiciliu -> Cloud -> Dispecerat).  

Protocol: HTTPS pentru toate schimburile de date.  

Format Date: Toate mesajele între module sunt în format JSON.  

API: REST API cu metodele POST, GET, PATCH, PUT.  

📊 Structura Bazei de Date (Schema Validată)
Cursor trebuie să respecte strict aceste tabele:  

users: id (PK), firstname, lastname, password, device_id (FK), permission_level (0-Pacient, 1-Medic, 2-Supraveghetor, 3-Îngrijitor, 4-Admin).  

meta_users: cnp (PK), user_id (FK), diagnosis, age, home_address, phone, mail.  

devices: id (PK), description, Sensor_list (JSON), date_installed.  

values: lid (PK), device_id (FK), timestamp, heart_rate, ambient_light, ambient_temperature, ambient_humidity, gas_detected.  

manual_values: lid (PK), user_id (FK), timestamp, measurement, value.  

alerts: lid (PK), device_id/user_id (FK), timestamp, alert_type, severity.  

⚠️ Reguli Critice de Business
Performanță: Timpul de raportare a alarmelor către dispecerat trebuie să fie de maximum 10 secunde.  

Eșantionare: Datele de la senzori se preiau la maximum 10 minute (valoare configurabilă).  

Securitate: Autentificare univocă pentru orice acces; datele sunt criptate în tranzit.  

Validare Duală: Validarea datelor se face obligatoriu atât în frontend (React/Mobile), cât și în backend (Node.js).  

📋 Instrucțiuni pentru Cursor
Ignoră PHP: Deși serverul local afișează Apache/PHP, întreaga logică trebuie scrisă în Node.js.  

Module I-P-O: Fiecare funcție nouă trebuie structurată pe modelul Intrări - Prelucrări - Ieșiri (ex: Validarea datelor la intrare, procesarea lor și salvarea în DB/confirmare la ieșire).  

Responsiveness: Interfețele web trebuie să fie responsive și să includă vizualizări grafice ale datelor (ex: grafice de evoluție pe 24h/7 zile).  

Audit: Menține un jurnal de audit (logs) pentru toate acțiunile efectuate.