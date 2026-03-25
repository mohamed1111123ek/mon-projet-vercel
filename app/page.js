"use client";

import { useEffect, useRef, useState } from "react";

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
    maxWidth: "560px",
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
  fileHint: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#6b7280",
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
  divider: {
    height: "1px",
    backgroundColor: "#e5e7eb",
    margin: "28px 0 24px",
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "1.1rem",
    fontWeight: 700,
  },
  sectionDescription: {
    margin: "0 0 16px",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  userCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    backgroundColor: "#f9fafb",
  },
  userName: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#111827",
  },
  userMeta: {
    margin: "6px 0 0",
    fontSize: "0.9rem",
    color: "#4b5563",
    lineHeight: 1.5,
  },
  downloadLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
  },
  emptyState: {
    margin: 0,
    padding: "16px",
    borderRadius: "14px",
    backgroundColor: "#f9fafb",
    color: "#6b7280",
    textAlign: "center",
    fontSize: "0.95rem",
  },
};

const initialForm = {
  nom: "",
  prenom: "",
};

export default function HomePage() {
  const [formData, setFormData] = useState(initialForm);
  const [pdfFile, setPdfFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setIsUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch("/api/save-user", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de charger les utilisateurs.");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setUsersError(error.message || "Impossible de charger les utilisateurs.");
    } finally {
      setIsUsersLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setPdfFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!pdfFile) {
      setFeedback({
        type: "error",
        text: "Veuillez selectionner un fichier PDF.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const body = new FormData();
      body.append("nom", formData.nom);
      body.append("prenom", formData.prenom);
      body.append("pdf", pdfFile);

      const response = await fetch("/api/save-user", {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setFeedback({
        type: "success",
        text: "Utilisateur et PDF enregistres avec succes.",
      });
      setFormData(initialForm);
      setUsers((current) => {
        if (data.user) {
          return [data.user, ...current];
        }

        return current;
      });
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          prenom avec un fichier PDF dans MongoDB Atlas.
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

          <div style={styles.field}>
            <label htmlFor="pdf" style={styles.label}>
              PDF
            </label>
            <input
              id="pdf"
              name="pdf"
              type="file"
              accept="application/pdf"
              required
              disabled={isLoading}
              onChange={handleFileChange}
              ref={fileInputRef}
              style={styles.input}
            />
            <p style={styles.fileHint}>
              Fichier PDF uniquement, taille maximale 5 Mo.
            </p>
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

        <div style={styles.divider} />

        <div>
          <h2 style={styles.sectionTitle}>Utilisateurs enregistres</h2>
          <p style={styles.sectionDescription}>
            Cette liste lit les 20 derniers documents directement depuis
            MongoDB.
          </p>

          {isUsersLoading ? (
            <p style={styles.emptyState}>Chargement des utilisateurs...</p>
          ) : usersError ? (
            <p style={{ ...styles.emptyState, color: "#dc2626" }}>{usersError}</p>
          ) : users.length === 0 ? (
            <p style={styles.emptyState}>Aucun utilisateur enregistre pour le moment.</p>
          ) : (
            <div style={styles.list}>
              {users.map((user, index) => (
                <article
                  key={user.id || `${user.nom}-${user.prenom}-${user.createdAt}-${index}`}
                  style={styles.userCard}
                >
                  <p style={styles.userName}>
                    {user.prenom} {user.nom}
                  </p>
                  <p style={styles.userMeta}>
                    PDF : {user.pdf?.filename || "Aucun fichier"}
                  </p>
                  {user.pdf && user.id ? (
                    <a
                      href={`/api/users/${user.id}/pdf`}
                      style={styles.downloadLink}
                    >
                      Telecharger le PDF
                    </a>
                  ) : null}
                  <p style={styles.userMeta}>
                    Ajoute le{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString("fr-FR")
                      : "date inconnue"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
