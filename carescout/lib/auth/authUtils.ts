import { auth } from "@/config/firebase-client";

export async function getCurrentUser() {
  try {
    await auth.authStateReady();
    return auth.currentUser;
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}