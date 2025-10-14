import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { updateTeamSchema, ApiResponse } from "@/lib/validations";

export async function GET(
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

    await connectDB();
    const { id } = await params;

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

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

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateTeamSchema.parse(body);

    // Check if team exists
    const existingTeam = await Team.findById(id);
    if (!existingTeam) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    // Check if team name already exists (if updating team name)
    if (
      validatedData.teamName &&
      validatedData.teamName !== existingTeam.teamName
    ) {
      const nameExists = await Team.findOne({
        teamName: validatedData.teamName,
        _id: { $ne: id },
      });
      if (nameExists) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: "Team name already exists" },
          { status: 400 }
        );
      }
    }

    const team = await Team.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: team,
      message: "Team updated successfully",
    });
  } catch (error) {
    console.error("Error updating team:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await connectDB();
    const { id } = await params;

    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
