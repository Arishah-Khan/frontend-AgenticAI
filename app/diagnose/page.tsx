"use client";
import { useState } from "react";

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDiagnose = async () => {
    if (!file) return alert("Please select an image first!");
    setLoading(true);

    const formData = new FormData();
    formData.append("question", "diagnose plant disease"); // backend expect karta hai
    formData.append("image", file); 

    try {
      const res = await fetch("http://localhost:8000/agent", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Backend Response:", data);
      setResult(data); 
    } catch (err) {
      console.error(err);
      alert("Error contacting agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🌿 Plant Disease Diagnosis</h1>

      {/* ✅ Image upload input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {/* ✅ Show selected image preview */}
      {file && (
        <div className="mb-4">
          <p className="font-medium">Selected Image:</p>
          <img
            src={URL.createObjectURL(file)}
            alt="Selected plant"
            className="mt-2 rounded-lg border shadow max-h-64"
          />
        </div>
      )}

      {/* ✅ Diagnose button */}
      <button
        onClick={handleDiagnose}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Diagnosing..." : "Upload & Diagnose"}
      </button>

      {/* ✅ Result display */}
      {result && (
        <div className="mt-6 p-4 border rounded-lg shadow-md w-full max-w-md bg-white">
          <h2 className="text-xl font-semibold mb-2">Agent Response</h2>

          {/* Show message */}
          <p>
            <strong>Message:</strong>{" "}
            {result.data?.message || result.message || "No message"}
          </p>

          {/* Show uploaded image if backend returns URL */}
          {result.data?.image_url && (
            <div className="mt-4">
              <p className="font-medium">Uploaded Image (server):</p>
              <img
                src={result.data.image_url}
                alt="Uploaded plant"
                className="mt-2 rounded-lg border shadow max-h-64"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
