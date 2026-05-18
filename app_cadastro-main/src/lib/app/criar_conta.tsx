import { useState } from "react";
import { Alert, Text, TextInput, View, Pressable, StyleSheet, ScrollView } from "react-native";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function CriarConta({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Passwords do not match");
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      Alert.alert("Account created!", "You can now log in.");
      navigation.navigate("Login");
    } catch (error: any) {
      const msg = error?.code === "auth/email-already-in-use"
        ? "Email already in use"
        : "Registration failed";
      Alert.alert(msg);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Create Account</Text>

      <Text style={s.label}>Name</Text>
      <TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName} />

      <Text style={s.label}>Email</Text>
      <TextInput
        style={s.input} placeholder="email@example.com"
        value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address"
      />

      <Text style={s.label}>Password</Text>
      <TextInput style={s.input} placeholder="Min. 6 characters" value={password} onChangeText={setPassword} secureTextEntry />

      <Text style={s.label}>Confirm Password</Text>
      <TextInput style={s.input} placeholder="Repeat password" value={confirm} onChangeText={setConfirm} secureTextEntry />

      <Pressable style={s.btn} onPress={handleRegister}>
        <Text style={s.btnText}>Create Account</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={[s.link, { marginTop: 16, textAlign: "center" }]}>Back to login</Text>
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
});
