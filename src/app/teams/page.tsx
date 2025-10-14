"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import TeamSearchBar from "@/components/teams/team-search";
import TeamTable from "@/components/teams/team-table";
import LoadingSpinner from "@/components/ui/loading-spinner";

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
  createdAt: string;
  updatedAt: string;
}

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchTeams();
  }, [session, status, router]);

  useEffect(() => {
    // Filter teams based on search term
    if (!searchTerm.trim()) {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(
        (team) =>
          team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.teamDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          team.members.some((member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredTeams(filtered);
    }
  }, [teams, searchTerm]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teams");
      const data = await response.json();

      if (data.success) {
        setTeams(data.data);
      } else {
        toast.error(data.error || "Failed to fetch teams");
      }
    } catch (error) {
      toast.error("An error occurred while fetching teams");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTeamSelect = (teamId: string, selected: boolean) => {
    if (selected) {
      setSelectedTeams((prev) => [...prev, teamId]);
    } else {
      setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTeams(filteredTeams.map((team) => team._id));
    } else {
      setSelectedTeams([]);
    }
  };

  const handleTeamExpand = (teamId: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleTeamDelete = (teamId: string) => {
    // Remove the deleted team from both teams and filteredTeams
    setTeams((prev) => prev.filter((team) => team._id !== teamId));
    setFilteredTeams((prev) => prev.filter((team) => team._id !== teamId));
    // Remove from selected teams if it was selected
    setSelectedTeams((prev) => prev.filter((id) => id !== teamId));
    // Remove from expanded teams if it was expanded
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

  const handleMemberUpdate = async (teamId: string) => {
    // Fetch updated team data and update the teams state
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      const data = await response.json();

      if (data.success) {
        // Update the specific team in both teams and filteredTeams
        setTeams((prev) =>
          prev.map((team) => (team._id === teamId ? data.data : team))
        );
        setFilteredTeams((prev) =>
          prev.map((team) => (team._id === teamId ? data.data : team))
        );
      }
    } catch (error) {
      console.error("Failed to refresh team data:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTeams.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTeams.length} team(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/teams/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamIds: selectedTeams }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // Remove deleted teams from state instead of refetching
        setTeams((prev) =>
          prev.filter((team) => !selectedTeams.includes(team._id))
        );
        setFilteredTeams((prev) =>
          prev.filter((team) => !selectedTeams.includes(team._id))
        );
        setSelectedTeams([]);
        // Clear expanded teams that were deleted
        setExpandedTeams((prev) => {
          const newSet = new Set(prev);
          selectedTeams.forEach((teamId) => newSet.delete(teamId));
          return newSet;
        });
      } else {
        toast.error(data.error || "Failed to delete teams");
      }
    } catch (error) {
      toast.error("An error occurred while deleting teams");
    }
  };

  const handleApprovalChange = async (
    teamId: string,
    approvalType: "manager" | "director",
    currentStatus: string
  ) => {
    const statusCycle = ["pending", "approved", "rejected"];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % 3];

    try {
      const response = await fetch(`/api/teams/${teamId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approvalType,
          status: nextStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Team Status Saved");
        fetchTeams(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to update approval status");
      }
    } catch (error) {
      toast.error("An error occurred while updating approval status");
    }
  };

  const handleTeamReorder = async (teamId: string, newOrder: number) => {
    try {
      const response = await fetch("/api/teams/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          newOrder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchTeams(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to reorder team");
      }
    } catch (error) {
      toast.error("An error occurred while reordering team");
    }
  };

  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="bg-primary text-white mb-4">
            {/* Desktop Header */}
            <div className="d-none d-md-flex justify-content-between align-items-center py-3 px-4">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 me-3">Teams</h4>
                <span className="badge bg-light text-dark">
                  {session.user?.role?.toUpperCase()}
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-light">
                  Welcome, {session.user?.name}
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="d-md-none py-3 px-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Teams</h5>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => signOut()}
                >
                  Sign Out
                </button>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-light small">
                  Welcome, {session.user?.name}
                </span>
                <span className="badge bg-light text-dark">
                  {session.user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Search and Actions */}
            <div className="row mb-3">
              <div className="col-12 col-md-8 mb-2 mb-md-0">
                <TeamSearchBar onSearch={handleSearch} />
              </div>
              <div className="col-12 col-md-4 text-end">
                <button
                  className="btn btn-warning w-100 w-md-auto"
                  onClick={() => router.push("/teams/new")}
                >
                  New Team
                </button>
              </div>
            </div>

            {/* Teams Table */}
            <div className="row">
              <div className="col-12">
                <div className="table-responsive">
                  <TeamTable
                    teams={filteredTeams}
                    selectedTeams={selectedTeams}
                    expandedTeams={expandedTeams}
                    onTeamSelect={handleTeamSelect}
                    onSelectAll={handleSelectAll}
                    onTeamExpand={handleTeamExpand}
                    onTeamReorder={handleTeamReorder}
                    onApprovalChange={handleApprovalChange}
                    onBulkDelete={handleBulkDelete}
                    onTeamDelete={handleTeamDelete}
                    onMemberUpdate={handleMemberUpdate}
                    userRole={session.user?.role as string}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
