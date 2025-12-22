import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session?.value) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify token is valid (decode and check timestamp)
    try {
      const decoded = Buffer.from(session.value, "base64").toString();
      const [email, timestamp] = decoded.split(":");
      
      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in ms

      if (email === "admin@gmail.com" && sessionAge < maxAge) {
        return NextResponse.json({ authenticated: true, email });
      }
    } catch {
      // Invalid token format
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ authenticated: false });
  }
}
