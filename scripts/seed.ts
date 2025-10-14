import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Team.deleteMany({});

    // Create demo users
    const users = await User.create([
      {
        email: "manager@demo.com",
        password: "password123",
        name: "John Manager",
        role: "manager",
      },
      {
        email: "director@demo.com",
        password: "password123",
        name: "Jane Director",
        role: "director",
      },
      {
        email: "member@demo.com",
        password: "password123",
        name: "Bob Member",
        role: "member",
      },
    ]);

    console.log("Created users:", users.length);

    // Create demo teams
    const teams = await Team.create([
      {
        teamName: "Team Alpha",
        teamDescription: "Frontend development team",
        approvedByManager: "approved",
        approvedByDirector: "pending",
        displayOrder: 0,
        members: [
          {
            name: "Alice Johnson",
            gender: "Female",
            dateOfBirth: new Date("1990-05-15"),
            contactNo: "1234567890",
          },
          {
            name: "Bob Smith",
            gender: "Male",
            dateOfBirth: new Date("1988-12-03"),
            contactNo: "9876543210",
          },
        ],
      },
      {
        teamName: "Team Beta",
        teamDescription: "Backend development team",
        approvedByManager: "pending",
        approvedByDirector: "approved",
        displayOrder: 1,
        members: [
          {
            name: "Charlie Brown",
            gender: "Male",
            dateOfBirth: new Date("1992-08-20"),
            contactNo: "5555555555",
          },
        ],
      },
      {
        teamName: "Team Gamma",
        teamDescription: "DevOps and infrastructure team",
        approvedByManager: "rejected",
        approvedByDirector: "rejected",
        displayOrder: 2,
        members: [
          {
            name: "Diana Prince",
            gender: "Female",
            dateOfBirth: new Date("1985-03-10"),
            contactNo: "1111111111",
          },
          {
            name: "Eve Wilson",
            gender: "Other",
            dateOfBirth: new Date("1995-11-25"),
            contactNo: "2222222222",
          },
        ],
      },
      {
        teamName: "Team Delta",
        teamDescription: "Quality assurance team",
        approvedByManager: "pending",
        approvedByDirector: "pending",
        displayOrder: 3,
        members: [
          {
            name: "Frank Miller",
            gender: "Male",
            dateOfBirth: new Date("1987-07-14"),
            contactNo: "3333333333",
          },
          {
            name: "Grace Lee",
            gender: "Female",
            dateOfBirth: new Date("1993-09-08"),
            contactNo: "4444444444",
          },
          {
            name: "Henry Davis",
            gender: "Male",
            dateOfBirth: new Date("1991-01-30"),
            contactNo: "6666666666",
          },
        ],
      },
    ]);

    console.log("Created teams:", teams.length);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
