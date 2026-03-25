import { NextResponse } from "next/server";

import { getDatabase } from "../../../mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

function formatUser(document) {
  return {
    id: document._id.toString(),
    nom: document.nom,
    prenom: document.prenom,
    createdAt: document.createdAt,
    pdf: document.pdf
      ? {
          filename: document.pdf.filename,
          contentType: document.pdf.contentType,
          size: document.pdf.size,
        }
      : null,
  };
}

export async function GET() {
  try {
    const db = await getDatabase();
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            nom: 1,
            prenom: 1,
            createdAt: 1,
            "pdf.filename": 1,
            "pdf.contentType": 1,
            "pdf.size": 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      users: users.map(formatUser),
    });
  } catch (error) {
    console.error("Erreur API GET /api/save-user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de lire les donnees.",
      },
      { status: 500 }
    );
  }
}

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

    const createdAt = new Date();
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer());
    const db = await getDatabase();

    const result = await db.collection("users").insertOne({
      nom,
      prenom,
      pdf: {
        filename: pdf.name,
        contentType: pdf.type || "application/pdf",
        size: pdf.size,
        data: pdfBuffer,
      },
      createdAt,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        nom,
        prenom,
        createdAt: createdAt.toISOString(),
        pdf: {
          filename: pdf.name,
          contentType: pdf.type || "application/pdf",
          size: pdf.size,
        },
      },
    });
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
