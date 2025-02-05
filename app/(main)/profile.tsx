import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser(); // Utiliser useUser pour obtenir l'email de l'utilisateur

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil utilisateur</Text>

      {user && (
        <Text style={styles.info}>
          Email : {user.primaryEmailAddress?.emailAddress || "Non défini"}
        </Text>
      )}

      <Button title="Se déconnecter" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});
