import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { bulkDeleteSchema, ApiResponse } from "@/lib/validations";

export async function DELETE(request: NextRequest) {
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
    const validatedData = bulkDeleteSchema.parse(body);

    const result = await Team.deleteMany({
      _id: { $in: validatedData.teamIds },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deletedCount: result.deletedCount },
      message: `${result.deletedCount} teams deleted successfully`,
    });
  } catch (error) {
    console.error("Error bulk deleting teams:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to delete teams" },
      { status: 500 }
    );
  }
}
