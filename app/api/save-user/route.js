import { NextResponse } from "next/server";

import { getDatabase } from "../../../mongodb";

export const runtime = "nodejs";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const nom = typeof formData.get("nom") === "string" ? formData.get("nom").trim() : "";
    const prenom =
      typeof formData.get("prenom") === "string" ? formData.get("prenom").trim() : "";
    const pdf = formData.get("pdf");

    if (!nom || !prenom) {
      return NextResponse.json(
        {
          success: false,
          error: "Les champs nom et prenom sont obligatoires.",
        },
        { status: 400 }
      );
    }

    if (!pdf || typeof pdf === "string" || typeof pdf.arrayBuffer !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Le fichier PDF est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!pdf.size) {
      return NextResponse.json(
        {
          success: false,
          error: "Le fichier PDF est vide.",
        },
        { status: 400 }
      );
    }

    const isPdfFile =
      pdf.type === "application/pdf" || pdf.name.toLowerCase().endsWith(".pdf");

    if (!isPdfFile) {
      return NextResponse.json(
        {
          success: false,
          error: "Seuls les fichiers PDF sont autorises.",
        },
        { status: 400 }
      );
    }

    if (pdf.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Le fichier PDF ne doit pas depasser 5 Mo.",
        },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const db = await getDatabase();

    await db.collection("users").insertOne({
      nom,
      prenom,
      pdf: {
        filename: pdf.name,
        contentType: pdf.type || "application/pdf",
        size: pdf.size,
        data: pdfBuffer,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const isFormDataError =
      error?.message?.toLowerCase().includes("formdata") ||
      error?.message?.toLowerCase().includes("multipart");

    if (isFormDataError) {
      return NextResponse.json(
        {
          success: false,
          error: "Le formulaire envoye est invalide.",
        },
        { status: 400 }
      );
    }

    console.error("Erreur API /api/save-user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur interne.",
      },
      { status: 500 }
    );
  }
}
