"use client";

import { useState, useEffect, useRef } from "react";
import {
  auth,
  signInWithGoogle,
  logOut,
  saveUserProfile,
  getUserProfile,
  saveUserItems,
  subscribeToUserItems,
  handleRedirectResult,
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// 아이템 컴포넌트
function Item({ brand, name, price, image }) {
  return (
    <div className="item">
      <div className="item-image">
        <img src={image || "https://via.placeholder.com/150"} alt={name} />
      </div>
      <p className="item-brand">{brand}</p>
      <p className="item-name">{name}</p>
      <p className="item-price">{price}</p>
    </div>
  );
}

// 프로필 컴포넌트
function Profile({
  profileImage,
  nickname,
  description,
  onPhotoChange,
  onNicknameChange,
  onDescriptionChange,
  isLoggedIn,
  isViewingShared,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempDescription, setTempDescription] = useState(description);
  const fileInputRef = useRef(null);
  const nicknameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const handlePhotoClick = () => {
    if (isLoggedIn && !isViewingShared) {
      setShowMenu(!showMenu);
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current.click();
    setShowMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 닉네임 편집 시작
  const handleNicknameClick = () => {
    if (isLoggedIn && !isViewingShared) {
      setIsEditingNickname(true);
      setTempNickname(nickname.replace("@", ""));
      setTimeout(() => {
        nicknameInputRef.current?.focus();
      }, 0);
    }
  };

  // 닉네임 편집 완료
  const handleNicknameSubmit = () => {
    const newNickname = tempNickname.trim();
    if (newNickname) {
      onNicknameChange(`@${newNickname}`);
    }
    setIsEditingNickname(false);
  };

  // 닉네임 편집 취소
  const handleNicknameCancel = () => {
    setTempNickname(nickname.replace("@", ""));
    setIsEditingNickname(false);
  };

  // 설명 편집 시작
  const handleDescriptionClick = () => {
    if (isLoggedIn && !isViewingShared) {
      setIsEditingDescription(true);
      setTempDescription(description);
      setTimeout(() => {
        descriptionInputRef.current?.focus();
      }, 0);
    }
  };

  // 설명 편집 완료
  const handleDescriptionSubmit = () => {
    const newDescription = tempDescription.trim();
    if (newDescription) {
      onDescriptionChange(newDescription);
    }
    setIsEditingDescription(false);
  };

  // 설명 편집 취소
  const handleDescriptionCancel = () => {
    setTempDescription(description);
    setIsEditingDescription(false);
  };

  // 키보드 이벤트 처리
  const handleNicknameKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNicknameSubmit();
    } else if (e.key === "Escape") {
      handleNicknameCancel();
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDescriptionSubmit();
    } else if (e.key === "Escape") {
      handleDescriptionCancel();
    }
  };

  // 메뉴 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest(".profile-pic-container")) {
        setShowMenu(false);
      }
      if (isEditingNickname && !e.target.closest(".nickname-edit")) {
        handleNicknameSubmit();
      }
      if (isEditingDescription && !e.target.closest(".description-edit")) {
        handleDescriptionSubmit();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu, isEditingNickname, isEditingDescription]);

  const canEdit = isLoggedIn && !isViewingShared;

  return (
    <div className="profile">
      <div className="profile-pic-container">
        <img
          src={profileImage || "https://via.placeholder.com/80"}
          alt="프로필"
          className="profile-pic"
          onClick={handlePhotoClick}
          style={{ cursor: canEdit ? "pointer" : "default" }}
        />
        {showMenu && canEdit && (
          <div className="photo-menu">
            <button onClick={handleChoosePhoto}>Choose Photo</button>
          </div>
        )}
      </div>
      <div className="profile-info">
        {/* 닉네임 편집 */}
        {isEditingNickname ? (
          <div className="nickname-edit">
            <span
              style={{ fontSize: "18px", fontWeight: "600", color: "black" }}
            >
              @
            </span>
            <input
              ref={nicknameInputRef}
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onKeyDown={handleNicknameKeyDown}
              onBlur={handleNicknameSubmit}
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "black",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "2px 6px",
                marginLeft: "2px",
                outline: "none",
                background: "white",
              }}
              maxLength={20}
            />
          </div>
        ) : (
          <h2
            onClick={handleNicknameClick}
            style={{
              cursor: canEdit ? "pointer" : "default",
              padding: "2px 0",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (canEdit) e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {nickname}
          </h2>
        )}

        {/* 설명 편집 */}
        {isEditingDescription ? (
          <div className="description-edit">
            <textarea
              ref={descriptionInputRef}
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              onKeyDown={handleDescriptionKeyDown}
              onBlur={handleDescriptionSubmit}
              style={{
                width: "100%",
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.5",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "6px 8px",
                outline: "none",
                background: "white",
                resize: "vertical",
                minHeight: "60px",
                fontFamily: "inherit",
              }}
              maxLength={200}
            />
          </div>
        ) : (
          <p
            className="description"
            onClick={handleDescriptionClick}
            style={{
              cursor: canEdit ? "pointer" : "default",
              padding: "4px",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (canEdit) e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {description}
          </p>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

// 탭 컴포넌트
function Tabs({ activeTab, onTabChange }) {
  return (
    <div className="tabs-guest">
      <div className="tab-center">
        <button
          onClick={() => onTabChange("zips")}
          className={`tab-btn ${activeTab === "zips" ? "active" : "inactive"}`}
        >
          Zips
        </button>
      </div>
      <div className="tab-center">
        <button
          onClick={() => onTabChange("wishlist")}
          className={`tab-btn ${activeTab === "wishlist" ? "active" : "inactive"}`}
        >
          Wishlist
        </button>
      </div>
    </div>
  );
}

// 공유 버튼 컴포넌트
function ShareButton({ onShare }) {
  return (
    <button onClick={onShare} className="share-btn" title="프로필 공유하기">
      <svg
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
      </svg>
    </button>
  );
}

// 아이템 추가 모달
function AddItemModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    brand: "",
    name: "",
    price: "",
    image: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      brand: formData.brand,
      name: formData.name,
      price: `${Number.parseInt(formData.price).toLocaleString()}won`,
      image: formData.image || "https://via.placeholder.com/150",
    });
    setFormData({ brand: "", name: "", price: "", image: "" });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price) => {
    const numericPrice = price.replace(/[^\d]/g, "");
    if (!numericPrice) return "";
    return Number.parseInt(numericPrice).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">새 아이템 추가</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">브랜드</label>
            <input
              className="form-input"
              type="text"
              value={formData.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
              placeholder="브랜드명을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">상품명</label>
            <textarea
              className="form-textarea"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="상품명을 입력하세요"
              rows="2"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">가격 (숫자만 입력)</label>
            <div className="price-input-container">
              <input
                className="form-input"
                type="text"
                value={formatPrice(formData.price)}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, "");
                  handleChange("price", numericValue);
                }}
                placeholder="예: 52000"
                required
              />
              <span className="price-suffix">won</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">이미지 URL</label>
            <input
              className="form-input"
              type="url"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="이미지 URL을 입력하세요"
              required
            />
          </div>
          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  로그인 모달
function LoginModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">로그인</div>
        <p
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          F-list를 사용하려면 로그인이 필요합니다.
        </p>
        <button className="google-btn" onClick={onLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>
      </div>
    </div>
  );
}

// 메인 앱
function App() {
  const [activeTab, setActiveTab] = useState("zips");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/80"
  );
  const [nickname, setNickname] = useState("@nickname");
  const [description, setDescription] = useState(
    "나만의 옷 입기를 원하나요? 자신의 옷장에 대한 설명을 적어주세요!"
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isViewingShared, setIsViewingShared] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [zipsItems, setZipsItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // 페이지 로드시 리다이렉트 결과 확인
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result && result.user) {
          console.log("리다이렉트 로그인 성공:", result.user);
        }
      } catch (error) {
        console.error("리다이렉트 결과 처리 실패:", error);
      }
    };

    checkRedirectResult();
  }, []);

  // Firebase 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setIsLoggedIn(true);

        // 사용자 프로필 로드
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setNickname(profile.nickname || `@${user.displayName || "user"}`);
            setDescription(
              profile.description ||
                "나만의 옷 입기를 원하나요? 자신의 옷장에 대한 설명을 적어주세요!"
            );
            setProfileImage(
              profile.profileImage ||
                user.photoURL ||
                "https://via.placeholder.com/80"
            );
          } else {
            // 첫 로그인시 기본 프로필 설정
            const defaultProfile = {
              nickname: `@${user.displayName || "user"}`,
              description:
                "나만의 옷 입기를 원하나요? 자신의 옷장에 대한 설명을 적어주세요!",
              profileImage: user.photoURL || "https://via.placeholder.com/80",
            };
            setNickname(defaultProfile.nickname);
            setDescription(defaultProfile.description);
            setProfileImage(defaultProfile.profileImage);
            await saveUserProfile(user.uid, defaultProfile);
          }

          // 사용자 아이템 실시간 구독
          const unsubscribeItems = subscribeToUserItems(
            user.uid,
            (itemsData) => {
              setZipsItems(itemsData.zipsItems || []);
              setWishlistItems(itemsData.wishlistItems || []);
            }
          );

          // 컴포넌트 언마운트시 구독 해제
          return () => unsubscribeItems();
        } catch (error) {
          console.error("사용자 데이터 로드 실패:", error);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setNickname("@nickname");
        setDescription(
          "나만의 옷 입기를 원하나요? 자신의 옷장에 대한 설명을 적어주세요!"
        );
        setProfileImage("https://via.placeholder.com/80");
        setZipsItems([]);
        setWishlistItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // URL에서 공유 데이터 로드
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get("shared");

    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(sharedData));
        setIsViewingShared(true);
        setNickname(decoded.nickname || "@nickname");
        setDescription(
          decoded.description ||
            "나만의 옷 입기를 원하나요? 자신의 옷장에 대한 설명을 적어주세요!"
        );
        setProfileImage(
          decoded.profileImage || "https://via.placeholder.com/80"
        );
        setZipsItems(decoded.zipsItems || []);
        setWishlistItems(decoded.wishlistItems || []);
      } catch (error) {
        console.error("공유 데이터 로드 실패:", error);
      }
    }
  }, []);

  // 프로필 변경시 Firebase에 저장
  const handleNicknameChange = async (newNickname) => {
    setNickname(newNickname);
    if (user && !isViewingShared) {
      try {
        await saveUserProfile(user.uid, { nickname: newNickname });
      } catch (error) {
        console.error("닉네임 저장 실패:", error);
      }
    }
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
    if (user && !isViewingShared) {
      try {
        await saveUserProfile(user.uid, { description: newDescription });
      } catch (error) {
        console.error("설명 저장 실패:", error);
      }
    }
  };

  const handlePhotoChange = async (newPhoto) => {
    setProfileImage(newPhoto);
    if (user && !isViewingShared) {
      try {
        await saveUserProfile(user.uid, { profileImage: newPhoto });
      } catch (error) {
        console.error("프로필 사진 저장 실패:", error);
      }
    }
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (isLoggedIn) {
      try {
        await logOut();
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃에 실패했습니다.");
      }
    } else {
      setShowLoginModal(true);
    }
  };

  // Google 로그인
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result) {
        console.log("로그인 성공:", result.user.email);
      }
      setShowLoginModal(false);
    } catch (error) {
      console.error("로그인 실패:", error);

      // 도메인 승인 오류인 경우 사용자에게 안내
      if (error.message.includes("도메인") && error.message.includes("승인")) {
        alert(
          `❌ ${error.message}\n\n해결 방법:\n1. Firebase Console (console.firebase.google.com) 접속\n2. f-list-455a9 프로젝트 선택\n3. Authentication → Settings → 승인된 도메인\n4. 현재 도메인 추가 후 다시 시도`
        );
      } else {
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 아이템 추가
  const handleAddItem = async (itemData) => {
    if (!user) return;

    const newItem = {
      id: Date.now().toString(),
      ...itemData,
    };

    try {
      let updatedZips = zipsItems;
      let updatedWishlist = wishlistItems;

      if (activeTab === "zips") {
        updatedZips = [...zipsItems, newItem];
        setZipsItems(updatedZips);
      } else {
        updatedWishlist = [...wishlistItems, newItem];
        setWishlistItems(updatedWishlist);
      }

      // Firebase에 저장
      await saveUserItems(user.uid, {
        zipsItems: updatedZips,
        wishlistItems: updatedWishlist,
      });

      alert("아이템이 추가되었습니다!");
    } catch (error) {
      console.error("아이템 저장 실패:", error);
      alert("아이템 저장에 실패했습니다.");
    }
  };

  // 모달 열기
  const handleOpenAddModal = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다!");
      return;
    }
    setShowAddModal(true);
  };

  // 공유 기능
  const handleShare = () => {
    const shareData = {
      nickname,
      description,
      profileImage,
      zipsItems,
      wishlistItems,
    };

    const encoded = encodeURIComponent(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encoded}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("공유 링크가 클립보드에 복사되었습니다! 🔗");
      })
      .catch(() => {
        prompt("공유 링크를 복사하세요:", shareUrl);
      });
  };

  const currentItems = activeTab === "zips" ? zipsItems : wishlistItems;

  if (loading) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <div className="header">
        <h1>F-list</h1>
        <div className="header-buttons">
          {isLoggedIn && !isViewingShared && (
            <ShareButton onShare={handleShare} />
          )}
          <button className="login-btn" onClick={handleLogin}>
            {isLoggedIn ? (
              // 열린 자물쇠 (로그인 상태)
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="10"
                  rx="2"
                  ry="2"
                  strokeWidth={2}
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path
                  d="M7 11V7a5 5 0 0 1 9.9-1"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // 닫힌 자물쇠 (로그아웃 상태)
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="10"
                  rx="2"
                  ry="2"
                  strokeWidth={2}
                />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
                <path
                  d="M7 11V7a5 5 0 1 1 10 0v4"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 공유 모드 알림 */}
      {isViewingShared && (
        <div className="shared-notice">
          <p>👀 다른 사용자의 F-list를 보고 있습니다</p>
        </div>
      )}

      {/* 프로필 */}
      <Profile
        profileImage={profileImage}
        nickname={nickname}
        description={description}
        onPhotoChange={handlePhotoChange}
        onNicknameChange={handleNicknameChange}
        onDescriptionChange={handleDescriptionChange}
        isLoggedIn={isLoggedIn}
        isViewingShared={isViewingShared}
      />

      {/* 탭 */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 아이템 섹션 */}
      <div>
        {currentItems.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">
              {activeTab === "zips" ? "Zips" : "위시리스트"}가 비어있습니다
            </p>
            {!isViewingShared && (
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>
                + 버튼을 눌러 아이템을 추가해보세요!
              </p>
            )}
          </div>
        ) : (
          <div className="items-grid">
            {currentItems.map((item) => (
              <Item key={item.id} {...item} />
            ))}
          </div>
        )}

        {/* 플로팅 추가 버튼 */}
        {isLoggedIn && !isViewingShared && (
          <button className="floating-add-btn" onClick={handleOpenAddModal}>
            +
          </button>
        )}
      </div>

      {/* 모달들 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleGoogleLogin}
      />
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
    </div>
  );
}

export default App;
