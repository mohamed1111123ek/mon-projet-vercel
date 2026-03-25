"use client";

import { useState } from "react";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f3f4f6",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    padding: "32px 24px",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 700,
    textAlign: "center",
  },
  description: {
    margin: "10px 0 24px",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    color: "#6b7280",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#ffffff",
  },
  button: {
    border: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#ffffff",
    background: "linear-gradient(135deg, #111827, #1f2937)",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  message: {
    margin: 0,
    fontSize: "0.95rem",
    textAlign: "center",
  },
};

const initialForm = {
  nom: "",
  prenom: "",
};

export default function HomePage() {
  const [formData, setFormData] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const response = await fetch("/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setFeedback({
        type: "success",
        text: "Utilisateur enregistre avec succes.",
      });
      setFormData(initialForm);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Impossible d'enregistrer les donnees.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Ajouter un utilisateur</h1>
        <p style={styles.description}>
          Remplissez le formulaire ci-dessous pour enregistrer un nom et un
          prenom dans MongoDB Atlas.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="nom" style={styles.label}>
              Nom
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Entrez le nom"
              required
              disabled={isLoading}
              autoComplete="family-name"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="prenom" style={styles.label}>
              Prenom
            </label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Entrez le prenom"
              required
              disabled={isLoading}
              autoComplete="given-name"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Envoi en cours..." : "Enregistrer"}
          </button>

          {feedback.text ? (
            <p
              aria-live="polite"
              style={{
                ...styles.message,
                color: feedback.type === "success" ? "#15803d" : "#dc2626",
              }}
            >
              {feedback.text}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
