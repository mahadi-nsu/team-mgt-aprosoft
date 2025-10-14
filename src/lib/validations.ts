import { z } from "zod";

export const memberSchema = z.object({
  name: z.string().min(1, "Member name is required").trim(),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z
    .union([z.string().transform((str) => new Date(str)), z.date()])
    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: "Invalid date format",
    }),
  contactNo: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^\d+$/, "Contact number must contain only digits"),
});

export const teamSchema = z.object({
  teamName: z.string().min(1, "Team name is required").trim(),
  teamDescription: z.string().min(1, "Team description is required").trim(),
  members: z.array(memberSchema).min(1, "At least one member is required"),
});

export const approvalStateSchema = z.enum(["pending", "approved", "rejected"]);

export const updateTeamSchema = teamSchema.partial().extend({
  approvedByManager: approvalStateSchema.optional(),
  approvedByDirector: approvalStateSchema.optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const bulkDeleteSchema = z.object({
  teamIds: z.array(z.string()).min(1, "At least one team must be selected"),
});

export const teamReorderSchema = z.object({
  teamId: z.string(),
  newOrder: z.number().int().min(0),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").trim(),
  role: z.enum(["manager", "director", "member"], {
    required_error: "Role is required",
  }),
});

export type TeamFormData = z.infer<typeof teamSchema>;
export type UpdateTeamData = z.infer<typeof updateTeamSchema>;
export type BulkDeleteData = z.infer<typeof bulkDeleteSchema>;
export type TeamReorderData = z.infer<typeof teamReorderSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
