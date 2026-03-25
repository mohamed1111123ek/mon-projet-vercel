import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getDatabase } from "../../../../../mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toBuffer(value) {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }

  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }

  if (value.buffer) {
    return toBuffer(value.buffer);
  }

  return null;
}

function sanitizeFilename(filename) {
  return (filename || "document.pdf").replace(/[\\/:*?"<>|]/g, "-");
}

export async function GET(_request, { params }) {
  try {
    const id = params?.id;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Identifiant invalide.",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          "pdf.filename": 1,
          "pdf.contentType": 1,
          "pdf.data": 1,
        },
      }
    );

    if (!user || !user.pdf?.data) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF introuvable.",
        },
        { status: 404 }
      );
    }

    const pdfBuffer = toBuffer(user.pdf.data);

    if (!pdfBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: "Le contenu du PDF est invalide.",
        },
        { status: 500 }
      );
    }

    const filename = sanitizeFilename(user.pdf.filename);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": user.pdf.contentType || "application/pdf",
        "Content-Length": String(pdfBuffer.length),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erreur API GET /api/users/[id]/pdf:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de telecharger le PDF.",
      },
      { status: 500 }
    );
  }
}
