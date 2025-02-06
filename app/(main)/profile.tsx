import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser(); 

  return (
    <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.gradient}>
      <View style={styles.container}>

        <Image
          source={{ uri: user?.imageUrl || "https://via.placeholder.com/150" }} 
          style={styles.profileImage}
        />

        <Text style={styles.title}>👤 Profil utilisateur</Text>

        {user && (
          <View style={styles.card}>
            <Text style={styles.info}>📧 Email :</Text>
            <Text style={styles.emailText}>
              {user.primaryEmailAddress?.emailAddress || "Non défini"}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

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
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 16,
    color: "#FFD700",
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
});
