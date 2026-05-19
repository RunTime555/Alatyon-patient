import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        name: true, email: true, mrn: true, phone: true, 
        address: true, image: true, bloodGroup: true,
        emergencyContact: true, emergencyPhone: true, 
        occupation: true, dob: true 
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token);
    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        image: body.image, // ✅ Base64 Image string እዚህ ጋር ይገባል
        bloodGroup: body.bloodGroup,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
        occupation: body.occupation,
        dob: body.dob
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}