import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserProfile {
  uid: string;
  nombre: string;
  apellido: string;
  correo: string;
  provincia: string;
  telefono: string;
  createdAt: Date;
  updatedAt: Date;
}

export const userProfileService = {
  // Crear o actualizar perfil de usuario
  async saveUserProfile(
    uid: string,
    profileData: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userRef = doc(db, "userProfiles", uid);
      const now = new Date();

      // Verificar si el documento existe
      const userSnap = await getDoc(userRef);
      const isNewProfile = !userSnap.exists();

      const dataToSave = {
        ...profileData,
        uid,
        updatedAt: now,
        ...(isNewProfile && { createdAt: now }),
      };

      await setDoc(userRef, dataToSave, { merge: true });
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "userProfiles", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },

  // Verificar si el perfil está completo
  isProfileComplete(profile: UserProfile | null): boolean {
    if (!profile) return false;

    return !!(
      profile.nombre &&
      profile.apellido &&
      profile.correo &&
      profile.provincia &&
      profile.telefono
    );
  },

  // Verificar si tiene los datos mínimos para comprar
  canMakePurchase(profile: UserProfile | null): boolean {
    if (!profile) return false;

    return !!(profile.provincia && profile.telefono);
  },
};
