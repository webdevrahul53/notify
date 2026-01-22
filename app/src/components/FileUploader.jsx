import React, { useRef, useEffect, useState } from "react";

export default function SingleImageUploader({ file, setFile }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

  /* ============================
     HANDLE FILE SELECT
  ============================ */
  const handleFile = (e) => {
    const selected = e.target.files[0];
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
     PREVIEW HANDLING (IMPORTANT)
  ============================ */
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.isExisting) {
      setPreview(`/api/files/${file.id}`);
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

  return (
    <div style={container}>
      {!file ? (
        <div style={uploadBox} onClick={() => inputRef.current.click()}>
          <div style={icon}>📷</div>
          <div style={title}>Upload Content</div>
          <div style={subText}>PNG, JPG, JPEG only</div>
        </div>
      ) : (
        <div style={previewBox}>
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
  border: "2px dashed #94a3b8",
  borderRadius: "18px",
  padding: "50px 20px",
  textAlign: "center",
  cursor: "pointer",
};

const icon = { fontSize: "38px", marginBottom: "10px" };
const title = { fontSize: "18px", fontWeight: 700 };
const subText = { fontSize: "14px", color: "#64748b" };

const previewBox = {
  background: "#fff",
  borderRadius: "18px",
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
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
