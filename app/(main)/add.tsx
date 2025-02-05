import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("meals.db");

type FoodItem = {
  food: {
    label: string;
    nutrients: {
      ENERC_KCAL: number;
    };
  };
};

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  const handleAddMeal = () => {
    if (!mealName || !calories) return;

    db.runAsync("INSERT INTO meals (name, calories) VALUES (?, ?)", [mealName, parseInt(calories, 10)])
      .then(() => router.push("/main"))
      .catch((err) => console.error("Erreur SQLite :", err));
  };

  const searchFood = async (query: string) => {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=YOUR_APP_ID&app_key=YOUR_APP_KEY&ingr=${query}`
    );
    const data = await response.json();
    setSearchResults(data.hints || []);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du repas"
        value={mealName}
        onChangeText={setMealName}
      />

      <TextInput
        style={styles.input}
        placeholder="Calories"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      <Button title="Ajouter" onPress={handleAddMeal} />

      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        onChangeText={searchFood}
      />

      <FlatList
        data={searchResults}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Button
            title={`${item.food.label} - ${item.food.nutrients.ENERC_KCAL} kcal`}
            onPress={() => {
              setMealName(item.food.label);
              setCalories(item.food.nutrients.ENERC_KCAL.toString());
            }}
          />
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
});
