"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface Member {
  name: string;
  gender: string;
  dateOfBirth: string | Date;
  contactNo: string;
}

interface EditMember {
  name: string;
  gender: string;
  dateOfBirth: string;
  contactNo: string;
}

interface MemberRowsProps {
  teamId: string;
  members: Member[];
  onMemberUpdate: () => void;
}

export default function MemberRows({
  teamId,
  members,
  onMemberUpdate,
}: MemberRowsProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditMember>({
    name: "",
    gender: "Male",
    dateOfBirth: "",
    contactNo: "",
  });

  const handleEditMember = (member: Member, index: number) => {
    setEditingMember(index.toString());

    // Format date for HTML date input (YYYY-MM-DD)
    let formattedDate = "";
    if (member.dateOfBirth) {
      const date = new Date(member.dateOfBirth);
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString();
        formattedDate = isoString.split("T")[0] || "";
      }
    }

    setEditForm({
      name: member.name,
      gender: member.gender,
      dateOfBirth: formattedDate,
      contactNo: member.contactNo,
    });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({
      name: "",
      gender: "Male",
      dateOfBirth: "",
      contactNo: "",
    });
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;

    // Basic validation
    if (!editForm.name.trim() || !editForm.contactNo.trim()) {
      toast.error("Name and contact number are required");
      return;
    }

    if (!/^\d+$/.test(editForm.contactNo)) {
      toast.error("Contact number must contain only digits");
      return;
    }

    try {
      // Get current team data
      const teamResponse = await fetch(`/api/teams/${teamId}`);
      const teamData = await teamResponse.json();

      if (!teamData.success) {
        toast.error("Failed to fetch team data");
        return;
      }

      // Update the specific member
      const updatedMembers = [...teamData.data.members];
      updatedMembers[parseInt(editingMember)] = editForm;

      // Update the team
      const updateResponse = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          members: updatedMembers,
        }),
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        toast.success("Member updated successfully");
        setEditingMember(null);
        onMemberUpdate();
      } else {
        toast.error(updateData.error || "Failed to update member");
      }
    } catch (error) {
      toast.error("An error occurred while updating member");
    }
  };

  const handleDeleteMember = async (
    memberIndex: number,
    memberName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${memberName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Get current team data
      const teamResponse = await fetch(`/api/teams/${teamId}`);
      const teamData = await teamResponse.json();

      if (!teamData.success) {
        toast.error("Failed to fetch team data");
        return;
      }

      // Remove the specific member
      const updatedMembers = teamData.data.members.filter(
        (_: Member, index: number) => index !== memberIndex
      );

      if (updatedMembers.length === 0) {
        toast.error("A team must have at least one member");
        return;
      }

      // Update the team
      const updateResponse = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          members: updatedMembers,
        }),
      });

      const updateData = await updateResponse.json();

      if (updateData.success) {
        toast.success("Member deleted successfully");
        onMemberUpdate();
      } else {
        toast.error(updateData.error || "Failed to delete member");
      }
    } catch (error) {
      toast.error("An error occurred while deleting member");
    }
  };

  return (
    <>
      {members.map((member, index) => (
        <tr key={index} className="table-light">
          <td></td>
          <td colSpan={2}>
            <div className="ps-4">
              {editingMember === index.toString() ? (
                <div className="row g-2">
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-sm"
                      value={editForm.gender}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={editForm.dateOfBirth}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          dateOfBirth: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Contact"
                      value={editForm.contactNo}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          contactNo: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveMember}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancelEdit}
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-medium">{member.name}</span>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-link p-0 text-primary"
                      onClick={() => handleEditMember(member, index)}
                      style={{ fontSize: "0.9rem" }}
                    >
                      Edit
                    </button>
                    <span className="text-muted">|</span>
                    <button
                      className="btn btn-link p-0 text-danger"
                      onClick={() => handleDeleteMember(index, member.name)}
                      style={{ fontSize: "0.9rem" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </td>
          <td></td>
          <td></td>
        </tr>
      ))}
    </>
  );
}
