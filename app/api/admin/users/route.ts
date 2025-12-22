import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Verify admin session
async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  
  if (!session?.value) return false;
  
  try {
    const decoded = Buffer.from(session.value, "base64").toString();
    const [email, timestamp] = decoded.split(":");
    const sessionAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000;
    
    return email === "admin@gmail.com" && sessionAge < maxAge;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        whatsapp: true,
        trialStartDate: true,
        trialDays: true,
        isSubscribed: true,
        subscriptionEnd: true,
        isSuspended: true,
        suspendReason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const totalUsers = users.length;
    const subscribedUsers = users.filter((u) => u.isSubscribed).length;
    const suspendedUsers = users.filter((u) => u.isSuspended).length;
    const trialUsers = users.filter((u) => {
      if (u.isSubscribed || u.isSuspended) return false;
      const trialStart = new Date(u.trialStartDate);
      const now = new Date();
      const diffInHours = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60);
      return diffInHours < (u.trialDays || 1) * 24;
    }).length;
    const expiredTrialUsers = users.filter((u) => {
      if (u.isSubscribed || u.isSuspended) return false;
      const trialStart = new Date(u.trialStartDate);
      const now = new Date();
      const diffInHours = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60);
      return diffInHours >= (u.trialDays || 1) * 24;
    }).length;

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        subscribedUsers,
        trialUsers,
        expiredTrialUsers,
        suspendedUsers,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Update user
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "suspend":
        updateData = {
          isSuspended: true,
          suspendReason: data?.reason || "Violation of terms",
        };
        break;
      
      case "unsuspend":
        updateData = {
          isSuspended: false,
          suspendReason: null,
        };
        break;
      
      case "subscribe":
        updateData = {
          isSubscribed: true,
          subscriptionEnd: data?.endDate ? new Date(data.endDate) : null,
        };
        break;
      
      case "unsubscribe":
        updateData = {
          isSubscribed: false,
          subscriptionEnd: null,
        };
        break;
      
      case "extendTrial":
        updateData = {
          trialDays: data?.days || 1,
        };
        break;
      
      case "resetTrial":
        updateData = {
          trialStartDate: new Date(),
          trialDays: data?.days || 1,
        };
        break;
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

