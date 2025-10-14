import mongoose, { Document, Schema } from "mongoose";

export interface IMember {
  name: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  contactNo: string;
}

export interface ITeam extends Document {
  teamName: string;
  teamDescription: string;
  approvedByManager: "pending" | "approved" | "rejected";
  approvedByDirector: "pending" | "approved" | "rejected";
  members: IMember[];
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>({
  name: {
    type: String,
    required: [true, "Member name is required"],
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: [true, "Gender is required"],
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Date of birth is required"],
  },
  contactNo: {
    type: String,
    required: [true, "Contact number is required"],
    validate: {
      validator: function (v: string) {
        return /^\d+$/.test(v);
      },
      message: "Contact number must contain only digits",
    },
  },
});

const TeamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      unique: true,
    },
    teamDescription: {
      type: String,
      required: [true, "Team description is required"],
      trim: true,
    },
    approvedByManager: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedByDirector: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    members: [MemberSchema],
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model is not already compiled
const Team = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
