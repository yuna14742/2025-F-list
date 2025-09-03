"use client";

import { useState, useRef } from "react";

const StyleBoard = ({ onBack, user }) => {
  const [boardName, setBoardName] = useState("보드 이름을 입력해주세요");
  const [isEditingName, setIsEditingName] = useState(false);
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleNameClick = () => {
    if (boardName === "보드 이름을 입력해주세요") {
      setBoardName("");
    }
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
  };

  const handleNameKeyPress = (e) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
      if (boardName.trim() === "") {
        setBoardName("보드 이름을 입력해주세요");
      }
    }
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (boardName.trim() === "") {
      setBoardName("보드 이름을 입력해주세요");
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (photos.length < 6) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhoto = {
            id: Date.now() + Math.random(),
            src: event.target.result,
            file: file,
          };
          setPhotos((prev) => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = "";
  };

  const handleAddPhoto = () => {
    if (photos.length < 6) {
      fileInputRef.current?.click();
    }
  };

  const handlePhotoDoubleClick = (photoId) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const renderPhotoGrid = () => {
    const gridItems = [];

    // 기존 사진들
    photos.forEach((photo, index) => {
      gridItems.push(
        <div
          key={photo.id}
          className="styleboard-photo"
          onDoubleClick={() => handlePhotoDoubleClick(photo.id)}
        >
          <img
            src={photo.src || "/placeholder.svg"}
            alt={`Photo ${index + 1}`}
            className="styleboard-photo-img"
          />
        </div>
      );
    });

    // + 버튼 (6장 미만일 때만)
    if (photos.length < 6) {
      gridItems.push(
        <div
          key="add-button"
          className="styleboard-add-btn"
          onClick={handleAddPhoto}
        >
          +
        </div>
      );
    }

    // 빈 슬롯들 (총 6개가 되도록)
    while (gridItems.length < 6) {
      gridItems.push(
        <div
          key={`empty-${gridItems.length}`}
          className="styleboard-empty-slot"
        />
      );
    }

    return gridItems;
  };

  return (
    <div className="styleboard">
      {/* Header */}
      <div className="styleboard-header">
        <h1>F-list</h1>
        <button onClick={onBack} className="styleboard-home-btn">
          🏠
        </button>
      </div>

      {/* Board Name */}
      <div className="styleboard-name-section">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onKeyPress={handleNameKeyPress}
            onBlur={handleNameBlur}
            className="styleboard-name-input"
            autoFocus
          />
        ) : (
          <h2
            onClick={handleNameClick}
            className={`styleboard-name ${
              boardName === "보드 이름을 입력해주세요" ? "placeholder" : ""
            }`}
          >
            {boardName}
          </h2>
        )}
      </div>

      {/* Photo Grid */}
      <div className="styleboard-grid">{renderPhotoGrid()}</div>

      {/* Instructions */}
      {photos.length === 0 && (
        <div className="styleboard-instructions">
          <p>'+' 버튼을 눌러 당신의 스타일을 저장해보세요</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default StyleBoard;
