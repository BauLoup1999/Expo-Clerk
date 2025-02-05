import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

// Définition des types pour TypeScript
type Meal = {
  id: number;
  name: string;
  calories: number;
};

const db = SQLite.openDatabaseSync("meals.db");

export default function MealsList() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    db.execAsync("CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, calories INTEGER);");
    fetchMeals();
  }, []);

  const fetchMeals = () => {
    db.getAllAsync<Meal>("SELECT * FROM meals;")
      .then((results) => {
        setMeals(results);
      })
      .catch((err) => console.error("Erreur SQLite :", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vos repas</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealItem}
           onPress={() => router.push(`/main/${item.id}`)}  // Change this to match the folder structure.
          >
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealCalories}>{item.calories} kcal</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Ajouter un repas"
        onPress={() => router.push("/(main)/add")}
        color="#007AFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  mealName: { fontSize: 18 },
  mealCalories: { fontSize: 16, color: "#888" },
});
