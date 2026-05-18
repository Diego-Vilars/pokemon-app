import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";

type Pokemon = {
  id: string;
  nome: string;
  tipo: string;
  nivel: string;
  hp: string;
  habilidade: string;
};

const TYPE_COLORS: Record<string, string> = {
  Normal:   "#A8A878",
  Fire:     "#F08030",
  Water:    "#6890F0",
  Grass:    "#78C850",
  Electric: "#F8D030",
  Ice:      "#98D8D8",
  Fighting: "#C03028",
  Poison:   "#A040A0",
  Ground:   "#E0C068",
  Flying:   "#A890F0",
  Psychic:  "#F85888",
  Bug:      "#A8B820",
  Rock:     "#B8A038",
  Ghost:    "#705898",
  Dragon:   "#7038F8",
  Dark:     "#705848",
  Steel:    "#B8B8D0",
  Fairy:    "#EE99AC",
};

function typeColor(tipo: string): string {
  return TYPE_COLORS[tipo] ?? "#A8A878";
}

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function ListarPokemon({ navigation }: any) {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);

  const trainerName =
    auth.currentUser?.displayName ??
    auth.currentUser?.email?.split("@")[0] ??
    "Trainer";

  async function carregarPokemons() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not Logged In", "Please login first.");
      navigation.navigate("Login");
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, "pokemons"), where("user", "==", user.email));
      const snapshot = await getDocs(q);
      const lista: Pokemon[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome ?? "",
        tipo: doc.data().tipo ?? "",
        // handle legacy "idade" field from old documents
        nivel: doc.data().nivel ?? doc.data().idade ?? "",
        hp: doc.data().hp ?? "",
        habilidade: doc.data().habilidade ?? "",
      }));
      setPokemons(lista);
    } catch (error) {
      console.log("Error loading pokemons:", error);
      Alert.alert("Error", "Failed to load Pokémon. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    carregarPokemons();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Trainer banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerGreeting}>Trainer</Text>
          <Text style={styles.bannerName}>{trainerName}</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {loading ? "Loading…" : `${pokemons.length} Pokémon in your Pokédex`}
        </Text>
        <Pressable onPress={carregarPokemons} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </Pressable>
      </View>

      {/* Empty state */}
      {!loading && pokemons.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Pokémon yet!</Text>
          <Text style={styles.emptySubtext}>Register your first Pokémon to fill your Pokédex.</Text>
        </View>
      )}

      {/* Pokémon cards */}
      {pokemons.map((pokemon) => {
        const bgColor = typeColor(pokemon.tipo);
        const textOnBadge = isDark(bgColor) ? "#fff" : "#222";
        return (
          <View key={pokemon.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName}>{pokemon.nome}</Text>
              {pokemon.tipo ? (
                <View style={[styles.typeBadge, { backgroundColor: bgColor }]}>
                  <Text style={[styles.typeBadgeText, { color: textOnBadge }]}>
                    {pokemon.tipo}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.statsRow}>
              {pokemon.nivel ? (
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>LVL</Text>
                  <Text style={styles.statChipValue}>{pokemon.nivel}</Text>
                </View>
              ) : null}
              {pokemon.hp ? (
                <View style={styles.statChip}>
                  <Text style={styles.statChipLabel}>HP</Text>
                  <Text style={styles.statChipValue}>{pokemon.hp}</Text>
                </View>
              ) : null}
              {pokemon.habilidade ? (
                <View style={[styles.statChip, styles.statChipWide]}>
                  <Text style={styles.statChipLabel}>MOVE</Text>
                  <Text style={styles.statChipValue} numberOfLines={1}>{pokemon.habilidade}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}

      <Pressable style={styles.addBtn} onPress={() => navigation.navigate("CadPokemon")}>
        <Text style={styles.addBtnText}>+ Register New Pokémon</Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2ff",
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3B4CCA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bannerGreeting: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bannerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFDE00",
    marginTop: 2,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statsText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  refreshBtn: {
    backgroundColor: "#3B4CCA",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 52,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#444",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statChip: {
    backgroundColor: "#f5f6ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
    minWidth: 52,
  },
  statChipWide: {
    flex: 1,
  },
  statChipLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#3B4CCA",
    letterSpacing: 0.8,
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginTop: 1,
  },
  addBtn: {
    backgroundColor: "#CC0000",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#CC0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: "#FFDE00",
    fontWeight: "800",
    fontSize: 16,
  },
});
