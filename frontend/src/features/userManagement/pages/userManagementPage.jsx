import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../../components/dashboard/ProtectedRoute";
import { toast } from "sonner";
import {
  getUsers,
  activateUser,
  deactivateUser,
  deleteUser,
  updateUser
} from "../api/user";
import { getDoctorByUserId } from "../../doctor/api/doctorApi";
import { getPatientByUserId } from "../../patient/api/patientApi";

const STATUS_LABELS = {
  10: { label: "Approved", className: "bg-green-100 text-green-800" },
  1: { label: "Not Approved", className: "bg-yellow-100 text-yellow-800" },
  99: { label: "Rejected", className: "bg-red-100 text-red-800" }
};

const ROLE_LABELS = {
  Admin: "bg-indigo-100 text-indigo-800",
  Doctor: "bg-blue-100 text-blue-800",
  Patient: "bg-slate-100 text-slate-800"
};

function getUserStatus(user) {
  if (user?.status !== undefined && user?.status !== null) {
    const status = STATUS_LABELS[user.status];
    return status ? status.label : `Status ${user.status}`;
  }
  return user.isActive ? "Active" : "Inactive";
}

function getStatusBadge(user) {
  if (user?.status !== undefined && user?.status !== null) {
    return (
      STATUS_LABELS[user.status]?.className || "bg-slate-100 text-slate-800"
    );
  }
  return user.isActive
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    role: "Patient",
    titles: "",
    phoneNumber: "",
    designation: "",
    isActive: true
  });
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await getUsers({
      pageNumber,
      pageSize,
      searchTerm: searchTerm.trim() || undefined,
      role: roleFilter || undefined
    });

    if (fetchError) {
      setError(fetchError);
      toast.error(fetchError);
      setUsers([]);
      setTotalPages(1);
    } else {
      const loadedUsers = data?.users || data?.items || [];
      setUsers(loadedUsers);
      setTotalPages(
        data?.totalPages ||
          Math.max(
            1,
            Math.ceil((data?.totalCount || loadedUsers.length) / pageSize)
          )
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, roleFilter]);

  const refreshList = async () => {
    setPageNumber(1);
    await loadUsers();
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setPageNumber(1);
    await loadUsers();
  };

  const showUserDetails = async (user) => {
    setSelectedUser(user);
    setUserDetails(null);
    setLoadingDetails(true);

    // Fetch role-specific details
    if (user.role === "Doctor") {
      const { data, error } = await getDoctorByUserId(user.id);
      if (error) {
        console.error("Failed to load doctor details:", error);
        toast.error("Failed to load doctor profile");
      } else {
        setUserDetails(data);
      }
    } else if (user.role === "Patient") {
      const { data, error } = await getPatientByUserId(user.id);
      if (error) {
        console.error("Failed to load patient details:", error);
        toast.error("Failed to load patient profile");
      } else {
        setUserDetails(data);
      }
    }

    setLoadingDetails(false);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setFormValues({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "Patient",
      titles: user.titles || "",
      phoneNumber: user.phoneNumber || "",
      designation: user.designation || "",
      isActive: user.isActive ?? true
    });
  };

  const closeModal = () => {
    setEditUser(null);
  };

  const handleUpdateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    if (!formValues.firstName || !formValues.lastName) {
      toast.error("First name and last name are required");
      return;
    }

    const { error: updateError } = await updateUser(editUser.id, {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      role: formValues.role,
      titles: formValues.titles,
      phoneNumber: formValues.phoneNumber,
      designation: formValues.designation,
      isActive: formValues.isActive
    });

    if (updateError) {
      toast.error(updateError);
    } else {
      toast.success("User updated successfully");
      closeModal();
      await loadUsers();
      if (selectedUser?.id === editUser.id) {
        await showUserDetails(editUser);
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(`Delete ${user.email || user.firstName || "this user"}?`)
    )
      return;

    const { error: deleteError } = await deleteUser(user.id);

    if (deleteError) {
      toast.error(deleteError);
    } else {
      toast.success("User deleted");
      if (selectedUser?.id === user.id) setSelectedUser(null);
      await loadUsers();
    }
  };

  const handleToggleActive = async (user) => {
    let result;
    if (user.isActive) {
      result = await deactivateUser(user.id);
    } else {
      result = await activateUser(user.id);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(user.isActive ? "User deactivated" : "User activated");
      await loadUsers();
    }
  };

  const handleStatusAction = async (user, statusValue) => {
    if (
      !window.confirm(
        `Set ${user.email || user.firstName} status to ${STATUS_LABELS[statusValue].label}?`
      )
    )
      return;

    const { error: updateError } = await updateUser(user.id, {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      titles: user.titles,
      phoneNumber: user.phoneNumber,
      designation: user.designation,
      fullName: user.fullName,
      isActive: user.isActive,
      status: statusValue
    });

    if (updateError) {
      toast.error(updateError);
    } else {
      toast.success(`Status updated to ${STATUS_LABELS[statusValue].label}`);
      await loadUsers();
    }
  };

  const counts = {
    total: users.length,
    active: users.filter((user) => user.isActive).length,
    inactive: users.filter((user) => !user.isActive).length,
    admins: users.filter((user) => user.role === "Admin").length,
    doctors: users.filter((user) => user.role === "Doctor").length,
    patients: users.filter((user) => user.role === "Patient").length
  };

  // Render doctor details
  const renderDoctorDetails = (doctor) => {
    return (
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-2">
          <h4 className="font-semibold text-slate-900">
            Professional Information
          </h4>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor Name:</span>
            <span className="font-medium">{doctor.doctorName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">License Number:</span>
            <span className="font-medium">{doctor.licenseNumber || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Specialization ID:</span>
            <span className="font-medium">
              {doctor.specializationId || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Qualifications:</span>
            <span className="font-medium">{doctor.qualifications || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Experience:</span>
            <span className="font-medium">{doctor.experience || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="font-medium">{doctor.department || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultation Fee:</span>
            <span className="font-medium">
              ${doctor.consultationFee || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Rating:</span>
            <span className="font-medium">{doctor.rating || "—"} ⭐</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span
              className={`font-medium ${doctor.status === "Active" ? "text-green-600" : "text-red-600"}`}
            >
              {doctor.status || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Verified:</span>
            <span className="font-medium">
              {doctor.isVerified ? "✅ Yes" : "❌ No"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Available:</span>
            <span className="font-medium">
              {doctor.isAvailable ? "🟢 Available" : "🔴 Not Available"}
            </span>
          </div>
          {doctor.bio && (
            <div className="mt-2">
              <span className="text-slate-500">Bio:</span>
              <p className="mt-1 text-slate-700">{doctor.bio}</p>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Member Since:</span>
            <span className="font-medium">
              {doctor.createdAt
                ? new Date(doctor.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render patient details
  const renderPatientDetails = (patient) => {
    return (
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-2">
          <h4 className="font-semibold text-slate-900">Personal Information</h4>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Full Name:</span>
            <span className="font-medium">{patient.fullName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone:</span>
            <span className="font-medium">{patient.phone || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date of Birth:</span>
            <span className="font-medium">
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString()
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Gender:</span>
            <span className="font-medium">{patient.gender || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Blood Group:</span>
            <span className="font-medium">{patient.bloodGroup || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span
              className={`font-medium ${patient.status === "Active" ? "text-green-600" : "text-red-600"}`}
            >
              {patient.status || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Registered On:</span>
            <span className="font-medium">
              {patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]} redirectTo="/admin-dashboard">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                User Management
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Manage accounts, approvals and analytics.
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Activate, deactivate, view, edit, delete users, and assign
                review statuses for approval workflows.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshList}
              className="inline-flex items-center gap-2 rounded-full bg-[#4B9AA8] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#4B9AA8]/20 transition hover:bg-[#3c828e]"
            >
              Refresh list
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Visible users
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {counts.total}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Showing current page
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Active
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {counts.active}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Accounts ready to use
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Inactive
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {counts.inactive}
              </p>
              <p className="mt-1 text-sm text-slate-500">Disabled accounts</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Roles
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {counts.admins} / {counts.doctors} / {counts.patients}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Admin / Doctor / Patient
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  User directory
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and filter accounts, then take direct action.
                </p>
              </div>
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email or ID"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4B9AA8] sm:w-80"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#4B9AA8]"
                >
                  <option value="">All roles</option>
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#4B9AA8] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#4B9AA8]/20 transition hover:bg-[#3c828e]"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last login</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        Loading users…
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-4 align-top">
                          <div className="font-semibold text-slate-900">
                            {user.firstName || user.email || "—"}{" "}
                            {user.lastName || ""}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${ROLE_LABELS[user.role] || "bg-slate-100 text-slate-800"}`}
                          >
                            {user.role || "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(user)}`}
                          >
                            {getUserStatus(user)}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-slate-500">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-4 py-4 align-top space-y-2">
                          <button
                            type="button"
                            onClick={() => showUserDetails(user)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="w-full rounded-2xl border border-[#4B9AA8] bg-white px-3 py-2 text-xs font-semibold text-[#4B9AA8] hover:bg-[#4B9AA8]/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            className={`w-full rounded-2xl px-3 py-2 text-xs font-semibold ${user.isActive ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="w-full rounded-2xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleStatusAction(user, 10)}
                              className="rounded-2xl bg-emerald-50 px-2 py-2 text-[10px] font-semibold text-emerald-800"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusAction(user, 1)}
                              className="rounded-2xl bg-yellow-50 px-2 py-2 text-[10px] font-semibold text-yellow-800"
                            >
                              Not Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusAction(user, 99)}
                              className="rounded-2xl bg-red-50 px-2 py-2 text-[10px] font-semibold text-red-800"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                Page {pageNumber} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() =>
                    setPageNumber((current) => Math.max(1, current - 1))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pageNumber >= totalPages}
                  onClick={() =>
                    setPageNumber((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Details & analysis
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Inspect selected user and see next action shortcuts.
              </p>
            </div>

            {selectedUser ? (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-2 sticky top-0 bg-slate-50 pt-2">
                  <p className="text-sm text-slate-500">Selected account</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedUser.firstName || selectedUser.email}
                  </h3>
                </div>

                <div className="grid gap-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="font-medium">Email</span>
                    <span className="text-slate-500">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="font-medium">Role</span>
                    <span className="text-slate-500">
                      {selectedUser.role || "Patient"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="font-medium">Status</span>
                    <span className="text-slate-500">
                      {getUserStatus(selectedUser)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="font-medium">Last login</span>
                    <span className="text-slate-500">
                      {selectedUser.lastLoginAt
                        ? new Date(selectedUser.lastLoginAt).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>

                {/* Role-specific details */}
                {loadingDetails ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">Loading details...</p>
                  </div>
                ) : (
                  userDetails && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      {selectedUser.role === "Doctor" &&
                        renderDoctorDetails(userDetails)}
                      {selectedUser.role === "Patient" &&
                        renderPatientDetails(userDetails)}
                    </div>
                  )
                )}

                <div className="grid gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => openEditModal(selectedUser)}
                    className="rounded-2xl bg-[#4B9AA8] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3c828e]"
                  >
                    Edit user
                  </button>
                  <button
                    onClick={() => handleToggleActive(selectedUser)}
                    className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-200"
                  >
                    {selectedUser.isActive
                      ? "Deactivate account"
                      : "Activate account"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Select a user from the list to view profile details and take
                action.
              </div>
            )}
          </aside>
        </div>

        {/* Edit User Modal */}
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
            <div className="w-full max-w-2xl overflow-hidden rounded-4xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Edit user
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update profile details and account status.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-500 hover:text-slate-900"
                >
                  Close
                </button>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    First name
                    <input
                      value={formValues.firstName}
                      onChange={(e) =>
                        handleUpdateField("firstName", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Last name
                    <input
                      value={formValues.lastName}
                      onChange={(e) =>
                        handleUpdateField("lastName", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Role
                    <select
                      value={formValues.role}
                      onChange={(e) =>
                        handleUpdateField("role", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    >
                      <option value="Patient">Patient</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Active
                    <select
                      value={formValues.isActive ? "true" : "false"}
                      onChange={(e) =>
                        handleUpdateField("isActive", e.target.value === "true")
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Titles
                    <input
                      value={formValues.titles}
                      onChange={(e) =>
                        handleUpdateField("titles", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Phone
                    <input
                      value={formValues.phoneNumber}
                      onChange={(e) =>
                        handleUpdateField("phoneNumber", e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Designation
                  <input
                    value={formValues.designation}
                    onChange={(e) =>
                      handleUpdateField("designation", e.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#4B9AA8]"
                  />
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="rounded-2xl bg-[#4B9AA8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3c828e]"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
