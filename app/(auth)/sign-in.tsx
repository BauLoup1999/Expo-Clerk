import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Connexion</Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Entrez votre email"
          placeholderTextColor="#ddd"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
        />
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor="#ddd"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <Pressable style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Vous n'avez pas de compte ?</Text>
          <Link href="/sign-up">
            <Text style={styles.signUpLink}>Inscription</Text>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  signUpText: {
    color: "white",
    fontSize: 14,
  },
  signUpLink: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});
