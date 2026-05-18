import { useState, useEffect } from "react";
import { Alert, Text, TextInput, View, Pressable, StyleSheet, ScrollView } from "react-native";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function Login({ navigation }: any) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email ?? null));
    return unsub;
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Fill in all fields");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.navigate("CadPokemon");
    } catch {
      Alert.alert("Wrong email or password");
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Login</Text>

      {userEmail ? (
        <View style={s.row}>
          <Text style={s.small}>Signed in as {userEmail}</Text>
          <Pressable onPress={() => signOut(auth)}><Text style={s.link}>Sign out</Text></Pressable>
        </View>
      ) : null}

      <Text style={s.label}>Email</Text>
      <TextInput
        style={s.input}
        placeholder="email@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={s.label}>Password</Text>
      <TextInput
        style={s.input}
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={s.btn} onPress={handleLogin}>
        <Text style={s.btnText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("CriarConta")}>
        <Text style={[s.link, { marginTop: 16, textAlign: "center" }]}>Create an account</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 60, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 28, color: "#111" },
  label: { fontSize: 13, color: "#555", marginBottom: 4, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 12, fontSize: 15, backgroundColor: "#fafafa",
  },
  btn: {
    backgroundColor: "#111", borderRadius: 8, padding: 14,
    alignItems: "center", marginTop: 24,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  link: { color: "#007AFF", fontSize: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  small: { fontSize: 13, color: "#666" },
});
