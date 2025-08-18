// Firebase v9+ 모듈 방식
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase 설정 (환경변수 사용)
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAP6OmdSxO5D2loKdTjJwdEI6Q0cvLHWhg",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "f-list-455a9.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "f-list-455a9",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "f-list-455a9.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "302817571953",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:302817571953:web:32a540938b37b6d93857d0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-R6WN0XXB95",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Provider 설정 추가
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Analytics 초기화 (선택사항)
let analytics = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}
export { analytics };

// 현재 도메인 확인 함수
const getCurrentDomain = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }
  return "localhost";
};

// 개발 환경 확인
const isDevelopment = () => {
  return import.meta.env.DEV || window.location.hostname === "localhost";
};

// 인증 함수들
// 인증 함수들
export const signInWithGoogle = async () => {
  try {
    const currentDomain = getCurrentDomain();
    console.log("현재 도메인:", currentDomain);
    console.log("개발 환경:", isDevelopment());

    // 개발 환경에서는 팝업 방식 우선 사용
    if (isDevelopment()) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("팝업 로그인 성공");
        return result;
      } catch (popupError) {
        console.log(
          "팝업 로그인 실패, 리다이렉트 방식으로 전환:",
          popupError.code
        );

        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.code === "auth/unauthorized-domain"
        ) {
          await signInWithRedirect(auth, googleProvider);
          return null;
        }
        throw popupError;
      }
    } else {
      // 프로덕션에서는 리다이렉트 방식 사용
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
  } catch (error) {
    console.error("Google 로그인 실패:", error);

    // 도메인 승인 오류 처리
    if (error.code === "auth/unauthorized-domain") {
      const currentDomain = getCurrentDomain();
      console.error("승인되지 않은 도메인:", currentDomain);

      throw new Error(
        `도메인 '${currentDomain}'이 Firebase에서 승인되지 않았습니다. Firebase Console에서 도메인을 추가해주세요.`
      );
    }

    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("리다이렉트 로그인 성공:", result.user.email);
    }
    return result;
  } catch (error) {
    console.error("리다이렉트 결과 처리 실패:", error);

    if (error.code === "auth/unauthorized-domain") {
      const currentDomain = getCurrentDomain();
      throw new Error(`도메인 '${currentDomain}'이 승인되지 않았습니다.`);
    }

    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    throw error;
  }
};

// Firestore 함수들
export const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), profileData, { merge: true });
    console.log("프로필 저장 성공");
  } catch (error) {
    console.error("프로필 저장 실패:", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("프로필 로드 성공");
      return docSnap.data();
    } else {
      console.log("프로필이 존재하지 않음");
      return null;
    }
  } catch (error) {
    console.error("프로필 로드 실패:", error);
    throw error;
  }
};

export const saveUserItems = async (userId, itemsData) => {
  try {
    await setDoc(doc(db, "userItems", userId), itemsData, { merge: true });
    console.log("아이템 저장 성공");
  } catch (error) {
    console.error("아이템 저장 실패:", error);
    throw error;
  }
};

export const getUserItems = async (userId) => {
  try {
    const docRef = doc(db, "userItems", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("아이템 로드 성공");
      return docSnap.data();
    } else {
      console.log("아이템이 존재하지 않음");
      return { zipsItems: [], wishlistItems: [] };
    }
  } catch (error) {
    console.error("아이템 로드 실패:", error);
    throw error;
  }
};

// 실시간 리스너
export const subscribeToUserItems = (userId, callback) => {
  const docRef = doc(db, "userItems", userId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      console.log("🔄 실시간 데이터 업데이트");
      callback(doc.data());
    } else {
      callback({ zipsItems: [], wishlistItems: [] });
    }
  });
};
