import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

type FoodItem = {
  food: {
    label: string;
    nutrients: {
      ENERC_KCAL: number; // Calories
    };
  };
};

const db = SQLite.openDatabaseSync("meals.db");

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState(""); 
  const [calories, setCalories] = useState(""); 
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [loading, setLoading] = useState(false);

  const searchFood = async (query: string) => {
    if (query === "") return;

    const appId = "b0fd2c53";
    const appKey = "269a60ce79a71c30db4bfddb94994903";

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${query}`
      );
      const data = await response.json();
      setSearchResults(data.hints || []);
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    if (!mealName || !calories) return;

    try {
      db.runAsync("INSERT INTO meals (name, calories) VALUES (?, ?)", [mealName, parseInt(calories, 10)]);
      console.log("Repas ajouté :", mealName, calories);
      router.push("/(main)");
    } catch (err) {
      console.error("Erreur lors de l'ajout du repas :", err);
    }
  };

  const handleOpenCamera = () => {
    router.push("/(main)/camera"); 
  };

  return (
    <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.gradient}>
      <View style={styles.container}>

        {/* Flèche de retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(main)")}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>🍽️ Ajouter un aliment</Text>

        {/* Champ pour nom du repas */}
        <TextInput
          style={styles.input}
          placeholder="Nom du repas"
          placeholderTextColor="#ddd"
          value={mealName}
          onChangeText={setMealName}
        />

        {/* Bouton Ajouter */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddMeal}>
          <Text style={styles.addButtonText}>✅ Ajouter l'aliment</Text>
        </TouchableOpacity>

        {/* Champ pour rechercher un aliment */}
        <TextInput
          style={styles.input}
          placeholder="Rechercher un aliment..."
          placeholderTextColor="#ddd"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchFood(text);
          }}
        />

        {/* Bouton Scanner un QR Code */}
        <TouchableOpacity style={styles.cameraButton} onPress={handleOpenCamera}>
          <MaterialIcons name="qr-code-scanner" size={28} color="white" />
          <Text style={styles.cameraButtonText}>📸 Scanner un QR Code</Text>
        </TouchableOpacity>

        {/* Loader */}
        {loading && <ActivityIndicator size="large" color="white" />}

        {/* Résultats de recherche */}
        <FlatList
          data={searchResults}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.foodItem}
              onPress={() => {
                setMealName(item.food.label);
                setCalories(item.food.nutrients.ENERC_KCAL.toString());
                setSearchResults([]);
                setSearchQuery("");
              }}
            >
              <Text style={styles.foodName}>{item.food.label}</Text>
              <Text style={styles.caloriesText}>{item.food.nutrients.ENERC_KCAL} kcal</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    paddingTop: 40, // Ajout d'un padding pour éviter le chevauchement avec la flèche
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "white",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  foodItem: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
    marginBottom: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  caloriesText: {
    fontSize: 16,
    color: "#FFD700",
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4500",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20, // Ajout d'une marge pour espacer correctement
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  backButton: {
    position: "absolute",
    top: 10, // Augmenté pour éviter le chevauchement
    left: 20,
  },
});
