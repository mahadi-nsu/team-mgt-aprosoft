import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Team from "@/models/Team";
import { teamSchema, ApiResponse } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { teamName: { $regex: search, $options: "i" } },
            { teamDescription: { $regex: search, $options: "i" } },
            { "members.name": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get teams with pagination
    const teams = await Team.find(searchQuery)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Team.countDocuments(searchQuery);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: teams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = teamSchema.parse(body);

    // Check if team name already exists
    const existingTeam = await Team.findOne({
      teamName: validatedData.teamName,
    });
    if (existingTeam) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Team name already exists" },
        { status: 400 }
      );
    }

    // Get the next display order
    const maxOrder = await Team.findOne().sort({ displayOrder: -1 });
    const nextOrder = maxOrder ? maxOrder.displayOrder + 1 : 1;

    const team = await Team.create({
      ...validatedData,
      displayOrder: nextOrder,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: team,
        message: "Team created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to create team" },
      { status: 500 }
    );
  }
}
