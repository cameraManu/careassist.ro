import React from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { LoginResponse } from "../../../shared/src/db.types.js";

const API_BASE_URL = "http://localhost:4000/api/v1";

export default function App(): React.JSX.Element {
  const [firstname, setFirstname] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [status, setStatus] = React.useState("Introdu datele de autentificare.");
  const [authData, setAuthData] = React.useState<LoginResponse | null>(null);

  async function onLogin(): Promise<void> {
    setStatus("Se verifica credentialele...");

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstname, password })
    });

    const data = (await response.json()) as LoginResponse | { message: string };
    if (!response.ok || !("token" in data)) {
      setAuthData(null);
      setStatus("Autentificare esuata.");
      return;
    }

    setAuthData(data);
    setStatus("Autentificare reusita.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CareAssist Mobile</Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Login pacient / ingrijitor</Text>
        <TextInput
          style={styles.input}
          value={firstname}
          onChangeText={setFirstname}
          placeholder="Utilizator"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Parola"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={onLogin}>
          <Text style={styles.buttonText}>Autentificare</Text>
        </TouchableOpacity>
        <Text style={styles.status}>{status}</Text>
        {authData ? (
          <Text style={styles.status}>Rol curent: {authData.user.permission_level}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#c6d3e8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  button: {
    backgroundColor: "#1f5eff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  status: {
    color: "#1c355e"
  }
});
