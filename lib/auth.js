import { cookies } from "next/headers";
import redis from "./redis";
import { prisma } from "./prisma"; 
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// 1. Token ማመንጨት (ለ Login)
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// 2. Token ማረጋገጥ (ይህ ነበር የጎደለው!)
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 3. User ለማግኘት
export async function getAuthUser() {
  const cookieStore = cookies();
  // የኩኪ ስም 'token' መሆኑን አረጋግጡ (ከ login route ጋር ይዛመዳል)
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  // ካልሆነ በ JWT ማረጋገጥ
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return await prisma.user.findUnique({ where: { id: decoded.id } });
}

// 4. Session functions (Redis + DB)
export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });

  await redis.set(`session:${session.token}`, userId, {
    ex: 60 * 60 * 24 * 7,
  });

  return session.token;
}

export async function deleteSession(token) {
  await redis.del(`session:${token}`);
  await prisma.session.deleteMany({ where: { token } }).catch(() => {});
}