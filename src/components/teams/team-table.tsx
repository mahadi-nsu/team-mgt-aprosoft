"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import ApprovalCircle from "./approval-circle";
import MemberRows from "./member-rows";

interface Team {
  _id: string;
  teamName: string;
  teamDescription: string;
  approvedByManager: "pending" | "approved" | "rejected";
  approvedByDirector: "pending" | "approved" | "rejected";
  members: Array<{
    name: string;
    gender: string;
    dateOfBirth: string;
    contactNo: string;
  }>;
  displayOrder: number;
}

interface TeamTableProps {
  teams: Team[];
  selectedTeams: string[];
  expandedTeams: Set<string>;
  onTeamSelect: (teamId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onTeamExpand: (teamId: string) => void;
  onTeamReorder: (teamId: string, newOrder: number) => void;
  onApprovalChange: (
    teamId: string,
    approvalType: "manager" | "director",
    currentStatus: string
  ) => void;
  onBulkDelete: () => void;
  userRole: string;
}

export default function TeamTable({
  teams,
  selectedTeams,
  expandedTeams,
  onTeamSelect,
  onSelectAll,
  onTeamExpand,
  onTeamReorder,
  onApprovalChange,
  onBulkDelete,
  userRole,
}: TeamTableProps) {
  const router = useRouter();
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${teamName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team deleted successfully");
        // Refresh the page to update the list
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to delete team");
      }
    } catch (error) {
      toast.error("An error occurred while deleting team");
    }
  };

  const handleDragStart = (e: React.DragEvent, teamId: string) => {
    setDraggedTeam(teamId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault();

    if (!draggedTeam || draggedTeam === targetTeamId) {
      setDraggedTeam(null);
      return;
    }

    const draggedIndex = teams.findIndex((team) => team._id === draggedTeam);
    const targetIndex = teams.findIndex((team) => team._id === targetTeamId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTeam(null);
      return;
    }

    // Calculate new order based on target position
    let newOrder: number;
    const targetTeam = teams[targetIndex];
    if (!targetTeam) {
      setDraggedTeam(null);
      return;
    }

    if (draggedIndex < targetIndex) {
      // Moving down: use target's order
      newOrder = targetTeam.displayOrder;
    } else {
      // Moving up: use target's order
      newOrder = targetTeam.displayOrder;
    }

    onTeamReorder(draggedTeam, newOrder);
    setDraggedTeam(null);
  };

  const handleDragEnd = () => {
    setDraggedTeam(null);
  };

  const isAllSelected =
    teams.length > 0 && selectedTeams.length === teams.length;
  const isIndeterminate =
    selectedTeams.length > 0 && selectedTeams.length < teams.length;

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-success">
          <tr>
            <th style={{ width: "50px" }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th>Team Name</th>
            <th className="d-none d-md-table-cell">Approved by Manager</th>
            <th className="d-none d-md-table-cell">Approved by Director</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <React.Fragment key={team._id}>
              <tr
                draggable
                onDragStart={(e) => handleDragStart(e, team._id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, team._id)}
                onDragEnd={handleDragEnd}
                className={`${draggedTeam === team._id ? "opacity-50" : ""} ${
                  selectedTeams.includes(team._id) ? "table-active" : ""
                }`}
                style={{ cursor: "move" }}
              >
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedTeams.includes(team._id)}
                    onChange={(e) => onTeamSelect(team._id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-link p-0 me-2"
                      onClick={() => onTeamExpand(team._id)}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {expandedTeams.has(team._id) ? "▼" : "▶"}
                    </button>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{team.teamName}</div>
                      {/* Mobile approval status */}
                      <div className="d-md-none mt-1">
                        <div className="d-flex gap-3">
                          <small className="text-muted">
                            Manager:
                            <ApprovalCircle
                              status={team.approvedByManager}
                              onStatusChange={() =>
                                onApprovalChange(
                                  team._id,
                                  "manager",
                                  team.approvedByManager
                                )
                              }
                              disabled={
                                userRole !== "manager" &&
                                userRole !== "director"
                              }
                            />
                          </small>
                          <small className="text-muted">
                            Director:
                            <ApprovalCircle
                              status={team.approvedByDirector}
                              onStatusChange={() =>
                                onApprovalChange(
                                  team._id,
                                  "director",
                                  team.approvedByDirector
                                )
                              }
                              disabled={
                                userRole !== "manager" &&
                                userRole !== "director"
                              }
                            />
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="d-none d-md-table-cell">
                  <ApprovalCircle
                    status={team.approvedByManager}
                    onStatusChange={() =>
                      onApprovalChange(
                        team._id,
                        "manager",
                        team.approvedByManager
                      )
                    }
                    disabled={userRole !== "manager" && userRole !== "director"}
                  />
                </td>
                <td className="d-none d-md-table-cell">
                  <ApprovalCircle
                    status={team.approvedByDirector}
                    onStatusChange={() =>
                      onApprovalChange(
                        team._id,
                        "director",
                        team.approvedByDirector
                      )
                    }
                    disabled={userRole !== "manager" && userRole !== "director"}
                  />
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-link p-0 text-primary"
                      onClick={() => router.push(`/teams/${team._id}/edit`)}
                      style={{ fontSize: "0.9rem" }}
                    >
                      Edit
                    </button>
                    <span className="text-muted d-none d-sm-inline">|</span>
                    <button
                      className="btn btn-link p-0 text-danger"
                      onClick={() => handleDeleteTeam(team._id, team.teamName)}
                      style={{ fontSize: "0.9rem" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              {expandedTeams.has(team._id) && (
                <MemberRows
                  teamId={team._id}
                  members={team.members}
                  onMemberUpdate={() => {
                    // Refresh teams data
                    window.location.reload();
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Bulk Delete Button */}
      {selectedTeams.length > 0 && (
        <div className="mt-3">
          <button className="btn btn-danger" onClick={onBulkDelete}>
            Delete All ({selectedTeams.length})
          </button>
        </div>
      )}

      {teams.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-users fa-3x mb-3"></i>
          <p>No teams found. Create your first team to get started.</p>
        </div>
      )}
    </div>
  );
}
