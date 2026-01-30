import React, { useRef, useEffect, useState } from "react";
import axiosInstance from "../utilities/axiosInstance";
import { keyFrames } from "../utilities/animkeyframes/allKeyframes";

export default function SingleImageUploader({ file, setFile }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ripple, setRipple] = useState(null);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

  console.log(file)
  /* ============================
     COMMON FILE HANDLER
  ============================ */
  const processFile = (selected) => {
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      alert("Only PNG, JPG, JPEG images are allowed");
      return;
    }

    setFile({
      name: selected.name,
      size: selected.size,
      type: selected.type,
      isExisting: false,
      file: selected,
    });
  };

  /* ============================
     INPUT SELECT
  ============================ */
  const handleFile = (e) => {
    processFile(e.target.files[0]);
  };

  /* ============================
     DRAG & DROP HANDLERS
  ============================ */
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);

    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  /* ============================
     PREVIEW HANDLING (IMPORTANT)
  ============================ */
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    console.log(file)
    if (file.isExisting) {
      setPreview(`${axiosInstance.defaults.baseURL}/event/image/${file._id}`);
      return;
    }

    const objectUrl = URL.createObjectURL(file.file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  /* ============================
     REMOVE FILE
  ============================ */
  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = keyFrames;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={container}>
      {!file ? (
        <div
          style={{
            ...uploadBox,
            ...(isDragging ? dragActive : {}),
          }}
          onClick={() => inputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {ripple && isDragging && (
            <span
              style={{
                ...rippleStyle,
                left: ripple.x,
                top: ripple.y,
              }}
            />
          )}
          <div style={icon}>📷</div>
          <div style={title}>Upload Content</div>
          <div style={subText}>Click or Drag & Drop Images (PNG, JPG, JPEG only)</div>
        </div>
      ) : (
        <div
          style={{
            ...previewBox,
            ...(isDragging ? dragActive : {}),
          }}
          onClick={() => inputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {ripple && isDragging && (
            <span
              style={{
                ...rippleStyle,
                left: ripple.x,
                top: ripple.y,
              }}
            />
          )}
          {isDragging && (
            <div style={dropOverlay}>
              <div style={overlayText}>Drop to replace image</div>
            </div>
          )}
          {preview && <img src={preview} alt="preview" style={image} />}

          <div style={info}>
            <div style={fileName}>{file.name}</div>
            <div style={fileSize}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>

          <button style={removeBtn} onClick={removeFile}>
            Remove
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={handleFile}
      />
    </div>
  );
}

/* ============================
   STYLES
============================ */
const container = {
  maxWidth: "420px",
  // margin: "auto",
  padding: "24px 0",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(16px)",
  // boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const uploadBox = {
  position: "relative", // 🔥 REQUIRED
  border: "2px dashed #94a3b8",
  borderRadius: "18px",
  padding: "50px 20px",
  textAlign: "center",
  cursor: "pointer",
  overflow: "hidden", // optional, cleaner ripple
};

const dragActive = {
  borderColor: "#2563eb",
  background: "rgba(37,99,235,0.08)",
};

const dropOverlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  borderRadius: "18px",
  pointerEvents: "none",   // 🔥 VERY IMPORTANT
  animation: "fadeIn 0.25s ease",
};

const overlayText = {
  color: "#fff",
  fontSize: "18px",
  fontWeight: 600,
};

const rippleStyle = {
  position: "absolute",
  width: "20px",
  height: "20px",
  background: "rgba(37,99,235,0.35)",
  borderRadius: "50%",
  transform: "translate(-50%, -50%)",
  animation: "ripple 0.6s ease-out",
  pointerEvents: "none",
};

const icon = { fontSize: "38px", marginBottom: "10px" };
const title = { fontSize: "18px", fontWeight: 700 };
const subText = { fontSize: "14px", color: "#64748b" };

const previewBox = {
  position: "relative",
  background: "#fff",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
  cursor: "pointer",
};

const image = {
  width: "100%",
  height: "240px",
  objectFit: "cover",
};

const info = { padding: "14px" };
const fileName = { fontWeight: 600 };
const fileSize = { fontSize: "12px", color: "#64748b" };

const removeBtn = {
  width: "100%",
  padding: "10px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};
