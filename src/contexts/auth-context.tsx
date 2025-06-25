import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  //   Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  signOut,
  //   GoogleAuthProvider,
  //   FacebookAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Modificar el useEffect:
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signInWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
    }
  };

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, "sign-in-button", {
        size: "invisible",
      });
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      console.log("Verification ID:", verificationId);
      // Manejar la verificación del código aquí
    } catch (error) {
      console.error("Error signing in with phone:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error("email-not-verified");
      }
    } catch (error: any) {
      console.error("Error signing in with email:", error);

      if (error.message === "email-not-verified") {
        throw new Error(
          "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada."
        );
      }

      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Enviar correo de verificación
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin, // URL de retorno después de verificar
        handleCodeInApp: false,
      });

      // Cerrar sesión hasta que verifique el email
      await signOut(auth);

      return {
        success: true,
        message: `¡Cuenta creada exitosamente! Hemos enviado un correo de verificación a ${email}. Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.`,
      };
    } catch (error: any) {
      console.error("Error signing up with email:", error);

      // Manejar errores específicos
      let errorMessage = "Error al crear la cuenta. Inténtalo de nuevo.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "Este correo electrónico ya está registrado. Intenta iniciar sesión.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El correo electrónico no es válido.";
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithPhone,
    signInWithEmail,
    signUpWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
