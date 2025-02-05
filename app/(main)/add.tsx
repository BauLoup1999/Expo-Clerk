import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

// Type pour les aliments
type FoodItem = {
  food: {
    label: string;
    nutrients: {
      ENERC_KCAL: number; // Calories
    };
  };
};

const db = SQLite.openDatabaseSync("meals.db"); // Assurez-vous que la base de données est correctement ouverte

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState(""); // Nom du repas
  const [calories, setCalories] = useState(""); // Calories du repas
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]); // Résultats de recherche d'aliments
  const [searchQuery, setSearchQuery] = useState(""); // Recherche de l'aliment

  // Fonction pour rechercher un aliment
  const searchFood = async (query: string) => {
    if (query === "") return;

    const appId = "6810951a"; // Ton App ID
    const appKey = "47913954f8829bd8e2901a6eb2319745"; // Ta clé API

    console.log(`Recherche de l'aliment: ${query}`); // Vérification du texte de recherche

    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${query}`
      );
      const data = await response.json();

      console.log("Réponse de l'API Edamam:", data); // Vérification de la réponse de l'API

      setSearchResults(data.hints || []); // Mettre à jour les résultats de la recherche
    } catch (error) {
      console.error("Erreur lors de la recherche d'aliments :", error);
    }
  };

  // Fonction pour ajouter un repas dans la base de données
  const handleAddMeal = () => {
    if (!mealName || !calories) return;

    try {
      // Insertion du repas dans la base de données
      db.runAsync("INSERT INTO meals (name, calories) VALUES (?, ?)", [mealName, parseInt(calories, 10)]);

      console.log("Repas ajouté :", mealName, calories);

      // Rediriger vers la liste des repas après l'ajout
      router.push("/(main)");
    } catch (err) {
      console.error("Erreur lors de l'ajout du repas :", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      {/* Champ pour le nom du repas */}
      <TextInput
        style={styles.input}
        placeholder="Nom du repas"
        value={mealName}
        onChangeText={setMealName}
      />

      {/* Champ pour les calories */}
      <TextInput
        style={styles.input}
        placeholder="Calories"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      {/* Bouton pour ajouter le repas */}
      <Button title="Ajouter" onPress={handleAddMeal} />

      {/* Barre de recherche d'aliments */}
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          searchFood(text); // Rechercher l'aliment chaque fois que l'utilisateur tape quelque chose
        }}
      />

      {/* Afficher les résultats de la recherche */}
      <FlatList
        data={searchResults}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Text style={styles.foodName}>{item.food.label}</Text>
            <Text>{item.food.nutrients.ENERC_KCAL} kcal</Text>
            <Button
              title="Sélectionner"
              onPress={() => {
                setMealName(item.food.label);
                setCalories(item.food.nutrients.ENERC_KCAL.toString());
              }}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  foodItem: {
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  foodName: { fontSize: 18, fontWeight: "500" },
});
