export type ApprovalState = "pending" | "approved" | "rejected";

export type UserRole = "manager" | "director" | "member";

export interface Member {
  name: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  contactNo: string;
}

export interface Team {
  _id: string;
  teamName: string;
  teamDescription: string;
  approvedByManager: ApprovalState;
  approvedByDirector: ApprovalState;
  members: Member[];
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamData {
  teamName: string;
  teamDescription: string;
  members: Omit<Member, "_id">[];
}

export interface UpdateTeamData extends Partial<CreateTeamData> {
  approvedByManager?: ApprovalState;
  approvedByDirector?: ApprovalState;
  displayOrder?: number;
}

export interface TeamReorderData {
  teamId: string;
  newOrder: number;
}
