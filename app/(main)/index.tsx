import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

type Meal = {
  id: number;
  name: string;
  calories: number;
  imageUrl?: string; // Ajout d'un champ optionnel pour l'image
};

const db = SQLite.openDatabaseSync("meals.db");

export default function MealsList() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealImages, setMealImages] = useState<{ [key: string]: string }>({}); // Stocke les images des aliments

  useEffect(() => {
    db.execAsync("CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, calories INTEGER);");
    fetchMeals();
  }, []);

  const fetchMeals = () => {
    db.getAllAsync<Meal>("SELECT * FROM meals;")
      .then((results) => {
        setMeals(results);
        fetchMealImages(results); // Récupère les images des aliments
      })
      .catch((err) => console.error("Erreur SQLite :", err));
  };

  // 🔹 Récupère les images des aliments via l'API Edamam
  const fetchMealImages = async (meals: Meal[]) => {
    const appId = "6810951a"; // Ton App ID
    const appKey = "47913954f8829bd8e2901a6eb2319745"; // Ta clé API

    let newMealImages: { [key: string]: string } = {};

    for (const meal of meals) {
      try {
        const response = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(meal.name)}`
        );
        const data = await response.json();

        if (data.hints.length > 0) {
          const foodImage = data.hints[0].food.image;
          if (foodImage) {
            newMealImages[meal.name] = foodImage;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'image :", error);
      }
    }

    setMealImages(newMealImages);
  };

  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Votre repas</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealItem}
            onPress={() => router.push(`/(main)/${item.id}`)}
          >
            {/* 🔹 Ajout de l'image */}
            {mealImages[item.name] ? (
              <Image source={{ uri: mealImages[item.name] }} style={styles.mealImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealCalories}>{item.calories} kcal</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.totalCalories}>Total des calories : {totalCalories} kcal</Text>
      <Button title="Ajouter un aliment" onPress={() => router.push("/(main)/add")} color="#007AFF" />
      <Button title="Accéder à mon profil" onPress={() => router.push("/(main)/profile")} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ddd",
  },
  mealName: { fontSize: 18 },
  mealCalories: { fontSize: 16, color: "#888" },
  totalCalories: { fontSize: 18, fontWeight: "700", marginTop: 20, textAlign: "right" },
});
