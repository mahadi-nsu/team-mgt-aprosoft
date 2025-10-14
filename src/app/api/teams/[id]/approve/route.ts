import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { approvalStateSchema, ApiResponse } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to approve (manager or director)
    const userRole = (session.user as any)?.role;
    if (userRole !== "manager" && userRole !== "director") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { approvalType, status } = body;

    // Validate approval type and status
    if (!["manager", "director"].includes(approvalType)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Invalid approval type" },
        { status: 400 }
      );
    }

    const validatedStatus = approvalStateSchema.parse(status);

    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Update the appropriate approval field
    const updateField =
      approvalType === "manager" ? "approvedByManager" : "approvedByDirector";
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { [updateField]: validatedStatus },
      { new: true }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedTeam,
      message: "Team approval status updated successfully",
    });
  } catch (error) {
    console.error("Error updating approval status:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update approval status" },
      { status: 500 }
    );
  }
}
