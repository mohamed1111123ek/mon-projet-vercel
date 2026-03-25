import { NextResponse } from "next/server";

import { getDatabase } from "../../../mongodb";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const nom = typeof body.nom === "string" ? body.nom.trim() : "";
    const prenom = typeof body.prenom === "string" ? body.prenom.trim() : "";

    if (!nom || !prenom) {
      return NextResponse.json(
        {
          success: false,
          error: "Les champs nom et prenom sont obligatoires.",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    await db.collection("users").insertOne({
      nom,
      prenom,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const isJsonError =
      error instanceof SyntaxError ||
      error?.message?.toLowerCase().includes("json");

    if (isJsonError) {
      return NextResponse.json(
        {
          success: false,
          error: "Le corps de la requete doit etre un JSON valide.",
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
