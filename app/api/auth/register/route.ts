import { NextRequest, NextResponse } from "next/server"; // Added NextRequest
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) { // Added type to fix red line
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // 1. Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (userExists) {
            return NextResponse.json({ error: "This email is already registered!" }, { status: 400 });
        }

        // 2. Generate MRN (Example: AL-7482)
        const generatedMRN = `AL-${Math.floor(1000 + Math.random() * 9000)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user in database
        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: "Patient",
                mrn: generatedMRN, 
            },
        });

        // 4. Send Welcome Email
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"Alatyon Hospital" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Alatyon Hospital MRN Number',
                html: `
                    <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
                        <p>Thank you for registering at Alatyon Hospital.</p>
                        <p style="font-size: 18px;">Your Medical Record Number (MRN): <b>${generatedMRN}</b></p>
                        <p>Please use this MRN or your email to login to your dashboard.</p>
                    </div>`
            });
        } catch (e) { 
            console.log("Email notification failed, but user was created in DB."); 
        }

        return NextResponse.json({ 
            success: true, 
            mrn: newUser.mrn, 
            message: "Registration successful!" 
        }, { status: 201 });

    } catch (error) {
        console.error("REGISTRATION_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error during registration" }, { status: 500 });
    }
}