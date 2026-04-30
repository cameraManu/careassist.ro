# careassist.ro
Proiect IS, Ambient Assisted Living.
Acest proiect vizează realizarea unui sistem informatic integrat pentru monitorizarea la domiciliu a persoanelor vârstnice, din punct de vedere medical și social. Sistemul permite colectarea automată a datelor fiziologice și ambientale, stocarea acestora în Cloud și intervenția operativă a unui dispecerat specializat în cazul apariției unor alarme.
# Arhitectură Tehnică
Sistemul este construit pe o structură three-tier  și cuprinde următoarele componente:  
Hardware (Edge): Module bazate pe ESP8266 și Arduino care colectează date de la senzori (puls, temperatură, gaz, umiditate, etc.).  
Cloud & Backend: Server web și bază de date pentru stocarea centralizată a informațiilor și procesarea automată a scenariilor de alarmă.  
Interfețe Utilizator: Aplicație mobilă pentru pacienți/îngrijitori și platformă web responsive pentru medici și personalul din dispecerat. 
# Funcționalități Principale
Monitorizare Multi-Senzor: Urmărirea parametrilor vitali (TA, puls, glicemie, greutate) și a celor de mediu (gaz, proximitate, inundatie).  
Sistem de Alarme: Notificări automate transmise în maxim 10 secunde către dispecerat și Smartphone în cazul depășirii pragurilor setate.  
Management Pacienți: Fișă medicală digitală, istoric de evoluție sub formă de grafice și generare de rapoarte statistice.  
Intervenție și Comunicare: Posibilitatea medicilor de a introduce recomandări și scheme de tratament, vizibile instant de către pacient. 
