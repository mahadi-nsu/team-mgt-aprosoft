"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import TeamMemberRow from "@/components/forms/team-member-row";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Member {
  name: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  contactNo: string;
}

interface TeamFormData {
  teamName: string;
  teamDescription: string;
  members: Member[];
}

interface TeamFormProps {
  teamId?: string;
  isEdit?: boolean;
}

export default function TeamForm({ teamId, isEdit = false }: TeamFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TeamFormData>({
    teamName: "",
    teamDescription: "",
    members: [
      {
        name: "",
        gender: "Male",
        dateOfBirth: "",
        contactNo: "",
      },
    ],
  });

  useEffect(() => {
    if (isEdit && teamId) {
      fetchTeamData();
    }
  }, [isEdit, teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}`);
      const data = await response.json();

      if (data.success) {
        const team = data.data;
        setFormData({
          teamName: team.teamName,
          teamDescription: team.teamDescription,
          members: team.members.map((member: any) => ({
            name: member.name,
            gender: member.gender,
            dateOfBirth: member.dateOfBirth.split("T")[0], // Convert to YYYY-MM-DD format
            contactNo: member.contactNo,
          })),
        });
      } else {
        toast.error(data.error || "Failed to fetch team data");
        router.push("/teams");
      }
    } catch (error) {
      toast.error("An error occurred while fetching team data");
      router.push("/teams");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMemberChange = (
    index: number,
    field: keyof Member,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: "",
          gender: "Male",
          dateOfBirth: "",
          contactNo: "",
        },
      ],
    }));
  };

  const handleRemoveMember = (index: number) => {
    if (formData.members.length <= 1) {
      toast.error("A team must have at least one member");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.teamName.trim()) {
      return "Team name is required";
    }

    if (!formData.teamDescription.trim()) {
      return "Team description is required";
    }

    if (formData.members.length === 0) {
      return "At least one team member is required";
    }

    for (let i = 0; i < formData.members.length; i++) {
      const member = formData.members[i];

      if (!member.name.trim()) {
        return `Member ${i + 1}: Name is required`;
      }

      if (!member.dateOfBirth) {
        return `Member ${i + 1}: Date of birth is required`;
      }

      if (!member.contactNo.trim()) {
        return `Member ${i + 1}: Contact number is required`;
      }

      if (!/^\d+$/.test(member.contactNo)) {
        return `Member ${i + 1}: Contact number must contain only digits`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);

      const url = isEdit ? `/api/teams/${teamId}` : "/api/teams";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: formData.teamName.trim(),
          teamDescription: formData.teamDescription.trim(),
          members: formData.members.map((member) => ({
            ...member,
            name: member.name.trim(),
            contactNo: member.contactNo.trim(),
            dateOfBirth: new Date(member.dateOfBirth),
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          isEdit ? "Team updated successfully" : "Team created successfully"
        );
        router.push("/teams");
      } else {
        toast.error(
          data.error || `Failed to ${isEdit ? "update" : "create"} team`
        );
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${isEdit ? "updating" : "creating"} team`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExit = () => {
    const confirmed = window.confirm(
      "Are you sure you want to exit? Any unsaved changes will be lost."
    );

    if (confirmed) {
      router.push("/teams");
    }
  };

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="bg-primary text-white mb-4">
            {/* Desktop Header */}
            <div className="d-none d-md-flex justify-content-between align-items-center py-3 px-4">
              <h4 className="mb-0">Team Details</h4>
              <div className="d-flex align-items-center gap-3">
                <span className="text-light">
                  Welcome, {session?.user?.name}
                </span>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="d-md-none py-3 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Team Details</h5>
                <span className="text-light small">
                  Welcome, {session?.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-8">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="card">
                <div className="card-body p-4">
                  {/* Team Name */}
                  <div className="mb-4">
                    <label htmlFor="teamName" className="form-label fw-medium">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="teamName"
                      value={formData.teamName}
                      onChange={(e) =>
                        handleInputChange("teamName", e.target.value)
                      }
                      placeholder="Enter team name"
                      disabled={saving}
                    />
                  </div>

                  {/* Team Description */}
                  <div className="mb-4">
                    <label
                      htmlFor="teamDescription"
                      className="form-label fw-medium"
                    >
                      Team Description *
                    </label>
                    <textarea
                      className="form-control"
                      id="teamDescription"
                      rows={3}
                      value={formData.teamDescription}
                      onChange={(e) =>
                        handleInputChange("teamDescription", e.target.value)
                      }
                      placeholder="Enter team description"
                      disabled={saving}
                    />
                  </div>

                  {/* Team Members */}
                  <div className="mb-4">
                    <label className="form-label fw-medium">
                      Team Member *
                    </label>

                    {/* Member Table Header */}
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Contact No.</th>
                            <th style={{ width: "100px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.members.map((member, index) => (
                            <TeamMemberRow
                              key={index}
                              member={member}
                              index={index}
                              onChange={handleMemberChange}
                              onRemove={handleRemoveMember}
                              disabled={saving}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add New Member Button */}
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={handleAddMember}
                      disabled={saving}
                    >
                      Add New Member
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleExit}
                      disabled={saving}
                    >
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
