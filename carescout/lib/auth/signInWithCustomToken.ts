import { auth } from "@/config/firebase-client"; // Fixed path
import { signInWithCustomToken as firebaseSignIn } from "firebase/auth";

export async function signInWithCustomToken(customToken: string) {
  try {
    const userCredential = await firebaseSignIn(auth, customToken);
    return await userCredential.user.getIdToken(); // Return Firebase ID token
  } catch (error) {
    throw new Error("Failed to sign in with custom token");
  }
}