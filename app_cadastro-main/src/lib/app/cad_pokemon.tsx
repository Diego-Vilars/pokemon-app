import { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, Alert,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { db, auth } from "../firebase";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { signOut } from "firebase/auth";

type Pokemon = {
  id: string;
  nome: string;
  tipo: string;
  nivel: string;
  hp: string;
  habilidade: string;
};

export default function CadPokemon({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [nivel, setNivel] = useState("");
  const [hp, setHp] = useState("");
  const [habilidade, setHabilidade] = useState("");
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);

  useEffect(() => { loadPokemons(); }, []);

  async function loadPokemons() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const q = query(collection(db, "pokemons"), where("user", "==", user.email));
      const snap = await getDocs(q);
      setPokemons(snap.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome ?? "",
        tipo: doc.data().tipo ?? "",
        nivel: doc.data().nivel ?? doc.data().idade ?? "",
        hp: doc.data().hp ?? "",
        habilidade: doc.data().habilidade ?? "",
      })));
    } catch (e) {
      console.log("load error", e);
    }
  }

  async function handleAdd() {
    if (!nome.trim() || !tipo.trim() || !nivel || !hp || !habilidade.trim()) {
      Alert.alert("Fill in all fields");
      return;
    }
    const user = auth.currentUser;
    if (!user) { navigation.navigate("Login"); return; }

    try {
      const docRef = await addDoc(collection(db, "pokemons"), {
        nome: nome.trim(), tipo: tipo.trim(),
        nivel, hp, habilidade: habilidade.trim(),
        user: user.email, createdAt: serverTimestamp(),
      });
      setPokemons(prev => [
        { id: docRef.id, nome: nome.trim(), tipo: tipo.trim(), nivel, hp, habilidade: habilidade.trim() },
        ...prev,
      ]);
      setNome(""); setTipo(""); setNivel(""); setHp(""); setHabilidade("");
    } catch (e) {
      Alert.alert("Error saving pokemon");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    navigation.navigate("Login");
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: "height" })}>
      <ScrollView style={s.container} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>My Pokémon</Text>
          <Pressable onPress={handleLogout}><Text style={s.logout}>Logout</Text></Pressable>
        </View>

        {/* Registration form */}
        <View style={s.form}>
          <Text style={s.formTitle}>Register New Pokémon</Text>

          <Text style={s.label}>Name</Text>
          <TextInput style={s.input} placeholder="e.g. Pikachu" value={nome} onChangeText={setNome} />

          <Text style={s.label}>Type</Text>
          <TextInput style={s.input} placeholder="e.g. Electric" value={tipo} onChangeText={setTipo} />

          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={s.label}>Level</Text>
              <TextInput style={s.input} placeholder="1–100" value={nivel} onChangeText={setNivel} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>HP</Text>
              <TextInput style={s.input} placeholder="e.g. 45" value={hp} onChangeText={setHp} keyboardType="numeric" />
            </View>
          </View>

          <Text style={s.label}>Ability / Move</Text>
          <TextInput style={s.input} placeholder="e.g. Thunderbolt" value={habilidade} onChangeText={setHabilidade} />

          <Pressable style={s.btn} onPress={handleAdd}>
            <Text style={s.btnText}>Add Pokémon</Text>
          </Pressable>
        </View>

        {/* Registered list */}
        <Text style={s.listTitle}>Registered ({pokemons.length})</Text>

        {pokemons.length === 0 && (
          <Text style={s.empty}>No Pokémon registered yet.</Text>
        )}

        {pokemons.map((p) => (
          <View key={p.id} style={s.card}>
            <View style={s.cardRow}>
              <Text style={s.cardName}>{p.nome}</Text>
              <Text style={s.cardType}>{p.tipo}</Text>
            </View>
            <Text style={s.cardDetail}>Lv.{p.nivel} · HP {p.hp} · {p.habilidade}</Text>
          </View>
        ))}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20, paddingTop: 16, paddingBottom: 48 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111" },
  logout: { fontSize: 14, color: "#007AFF" },
  form: {
    borderWidth: 1, borderColor: "#e0e0e0",
    borderRadius: 10, padding: 16, marginBottom: 28,
  },
  formTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 8 },
  label: { fontSize: 12, color: "#666", marginTop: 10, marginBottom: 3 },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8,
    padding: 11, fontSize: 14, backgroundColor: "#fafafa",
  },
  row: { flexDirection: "row" },
  btn: {
    backgroundColor: "#111", borderRadius: 8,
    padding: 13, alignItems: "center", marginTop: 16,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 10 },
  empty: { color: "#999", fontSize: 14, textAlign: "center", paddingVertical: 20 },
  card: {
    borderWidth: 1, borderColor: "#e8e8e8",
    borderRadius: 8, padding: 12, marginBottom: 8,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111" },
  cardType: { fontSize: 13, color: "#555", fontWeight: "600" },
  cardDetail: { fontSize: 12, color: "#888" },
});
