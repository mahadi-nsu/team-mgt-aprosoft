import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { teamReorderSchema, ApiResponse } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = teamReorderSchema.parse(body);

    // Get the team being moved
    const teamToMove = await Team.findById(validatedData.teamId);
    if (!teamToMove) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    const oldOrder = teamToMove.displayOrder;
    const newOrder = validatedData.newOrder;

    // If the order hasn't changed, no need to update
    if (oldOrder === newOrder) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: teamToMove,
        message: "Team order unchanged",
      });
    }

    // Update the team's order
    await Team.findByIdAndUpdate(validatedData.teamId, {
      displayOrder: newOrder,
    });

    // Shift other teams' orders to avoid conflicts
    if (oldOrder < newOrder) {
      // Moving down: shift teams between old and new position up
      await Team.updateMany(
        {
          _id: { $ne: validatedData.teamId },
          displayOrder: { $gt: oldOrder, $lte: newOrder },
        },
        { $inc: { displayOrder: -1 } }
      );
    } else {
      // Moving up: shift teams between new and old position down
      await Team.updateMany(
        {
          _id: { $ne: validatedData.teamId },
          displayOrder: { $gte: newOrder, $lt: oldOrder },
        },
        { $inc: { displayOrder: 1 } }
      );
    }

    // Get the updated team
    const updatedTeam = await Team.findById(validatedData.teamId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedTeam,
      message: "Team order updated successfully",
    });
  } catch (error) {
    console.error("Error reordering team:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to reorder team" },
      { status: 500 }
    );
  }
}
