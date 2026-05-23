// app/api/lab/result/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id } = await params;

    const result = await prisma.labResult.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id:   true,
            name: true,
            mrn:  true,
            labResults: {
              orderBy: { createdAt: "desc" },
              select: {
                id:        true,
                testName:  true,
                testValue: true,
                unit:      true,
                status:    true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET_RESULT:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}