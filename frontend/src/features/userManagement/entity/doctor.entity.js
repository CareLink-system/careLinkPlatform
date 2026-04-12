// feature/userManagement/entity/doctor.entity.js

import User from "./user.entity";

/**
 * Doctor Entity class for frontend
 * Represents the doctor model based on backend Doctor model and DTOs
 */
export class Doctor {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.specializationId = data.specializationId || "";
    this.licenseNumber = data.licenseNumber || "";
    this.qualifications = data.qualifications || null;
    this.experience = data.experience || null;
    this.bio = data.bio || null;
    this.rating = data.rating ?? 0;
    this.isAvailable = data.isAvailable ?? true;
    this.department = data.department || null;
    this.consultationFee = data.consultationFee ?? 0;
    this.isVerified = data.isVerified ?? false;
    this.status = data.status || (data.isVerified ? "Verified" : "Pending");
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;

    // Optional: Store associated user data if provided
    this.user = data.user ? new User(data.user) : null;

    // Optional: Store availability slots
    this.availabilitySlots = data.availabilitySlots || [];
  }

  /**
   * Get doctor's full name (from associated user)
   * @returns {string}
   */
  getFullName() {
    if (this.user) {
      return this.user.getFullName();
    }
    return `Doctor #${this.id}`;
  }

  /**
   * Get doctor's display name with title and specialization
   * @returns {string}
   */
  getDisplayName() {
    const parts = [];
    if (this.user?.titles) parts.push(this.user.titles);
    if (this.user?.firstName) parts.push(this.user.firstName);
    if (this.user?.lastName) parts.push(this.user.lastName);
    if (this.specializationId) parts.push(`(${this.specializationId})`);
    return parts.join(" ") || `Doctor ${this.id}`;
  }

  /**
   * Get formatted consultation fee
   * @param {string} currency - Currency symbol (default: $)
   * @returns {string}
   */
  getFormattedFee(currency = "$") {
    return `${currency}${this.consultationFee.toLocaleString()}`;
  }

  /**
   * Get rating as percentage
   * @returns {number}
   */
  getRatingPercentage() {
    return (this.rating / 5) * 100;
  }

  /**
   * Get star rating display (e.g., "4.5/5")
   * @returns {string}
   */
  getStarRating() {
    return `${this.rating.toFixed(1)}/5`;
  }

  /**
   * Check if doctor is available for consultation
   * @returns {boolean}
   */
  isAvailableForConsultation() {
    return this.isAvailable && this.isVerified;
  }

  /**
   * Check if doctor is verified
   * @returns {boolean}
   */
  isVerifiedDoctor() {
    return this.isVerified === true;
  }

  /**
   * Get doctor status badge color
   * @returns {string} - Tailwind color class
   */
  getStatusBadgeColor() {
    if (!this.isVerified) return "bg-yellow-100 text-yellow-800";
    if (this.isAvailable) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  }

  /**
   * Get doctor status text
   * @returns {string}
   */
  getStatusText() {
    if (!this.isVerified) return "Pending Verification";
    if (this.isAvailable) return "Available";
    return "Unavailable";
  }

  /**
   * Get experience display
   * @returns {string}
   */
  getExperienceDisplay() {
    if (!this.experience) return "Not specified";
    return `${this.experience} years`;
  }

  /**
   * Get qualifications as array
   * @returns {string[]}
   */
  getQualificationsList() {
    if (!this.qualifications) return [];
    return this.qualifications.split(",").map((q) => q.trim());
  }

  /**
   * Get consultation fee range display
   * @returns {string}
   */
  getFeeRange() {
    if (this.consultationFee === 0) return "Free";
    return this.getFormattedFee();
  }

  /**
   * Convert to JSON for API requests
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      specializationId: this.specializationId,
      licenseNumber: this.licenseNumber,
      qualifications: this.qualifications,
      experience: this.experience,
      bio: this.bio,
      rating: this.rating,
      isAvailable: this.isAvailable,
      department: this.department,
      consultationFee: this.consultationFee,
      isVerified: this.isVerified,
      status: this.status,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString()
    };
  }

  /**
   * Create Doctor instance from DoctorResponseDto
   * @param {Object} responseDto - DoctorResponseDto from API
   * @param {Object} userData - Optional user data to associate
   * @returns {Doctor}
   */
  static fromResponseDto(responseDto, userData = null) {
    const doctor = new Doctor(responseDto);
    if (userData) {
      doctor.user = new User(userData);
    }
    return doctor;
  }

  /**
   * Create Doctor instance from paginated response
   * @param {Object} paginatedResponse - Paginated doctor response
   * @returns {Object} - Object containing doctors array and pagination info
   */
  static fromPaginatedResponse(paginatedResponse) {
    return {
      doctors: (paginatedResponse.doctors || paginatedResponse.items || []).map(
        (doctor) => new Doctor(doctor)
      ),
      pageNumber: paginatedResponse.pageNumber || paginatedResponse.page,
      pageSize: paginatedResponse.pageSize || paginatedResponse.limit,
      totalCount: paginatedResponse.totalCount || paginatedResponse.total,
      totalPages: paginatedResponse.totalPages
    };
  }

  /**
   * Create payload for doctor creation (CreateDoctorDto)
   * @returns {Object}
   */
  toCreatePayload() {
    const payload = {
      userId: this.userId,
      specializationId: this.specializationId,
      licenseNumber: this.licenseNumber,
      consultationFee: this.consultationFee
    };

    if (this.qualifications) payload.qualifications = this.qualifications;
    if (this.experience) payload.experience = this.experience;
    if (this.bio) payload.bio = this.bio;
    if (this.department) payload.department = this.department;

    return payload;
  }

  /**
   * Create payload for doctor update (UpdateDoctorDto)
   * @returns {Object}
   */
  toUpdatePayload() {
    const payload = {
      specializationId: this.specializationId,
      licenseNumber: this.licenseNumber,
      consultationFee: this.consultationFee,
      isAvailable: this.isAvailable
    };

    if (this.qualifications) payload.qualifications = this.qualifications;
    if (this.experience) payload.experience = this.experience;
    if (this.bio) payload.bio = this.bio;
    if (this.department) payload.department = this.department;

    return payload;
  }

  /**
   * Update doctor properties from object
   * @param {Object} updates - Partial doctor data
   */
  update(updates) {
    Object.assign(this, updates);
    if (updates.createdAt) this.createdAt = new Date(updates.createdAt);
    if (updates.updatedAt) this.updatedAt = new Date(updates.updatedAt);
    if (updates.user) this.user = new User(updates.user);
    return this;
  }

  /**
   * Clone the doctor instance
   * @returns {Doctor}
   */
  clone() {
    return new Doctor(this.toJSON());
  }

  /**
   * Add availability slot
   * @param {Object} slot - Availability slot object
   */
  addAvailabilitySlot(slot) {
    this.availabilitySlots.push(slot);
  }

  /**
   * Remove availability slot by index
   * @param {number} index - Slot index
   */
  removeAvailabilitySlot(index) {
    this.availabilitySlots.splice(index, 1);
  }

  /**
   * Clear all availability slots
   */
  clearAvailabilitySlots() {
    this.availabilitySlots = [];
  }
}

/**
 * Validation helper functions for doctor data
 */
export const DoctorValidators = {
  isValidLicenseNumber: (licenseNumber) => {
    return licenseNumber && licenseNumber.trim().length >= 3;
  },

  isValidConsultationFee: (fee) => {
    return typeof fee === "number" && fee >= 0;
  },

  isValidSpecializationId: (specializationId) => {
    return specializationId && specializationId.trim().length > 0;
  },

  isValidUserId: (userId) => {
    return typeof userId === "number" && userId > 0;
  },

  isValidRating: (rating) => {
    return typeof rating === "number" && rating >= 0 && rating <= 5;
  },

  isValidExperience: (experience) => {
    if (!experience) return true;
    const years = parseInt(experience);
    return !isNaN(years) && years >= 0 && years <= 60;
  },

  isValidQualifications: (qualifications) => {
    if (!qualifications) return true;
    return qualifications.length >= 2;
  },

  isRequired: (value) => {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  }
};

/**
 * Doctor status constants
 */
export const DoctorStatus = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended"
};

/**
 * Doctor availability constants
 */
export const DoctorAvailability = {
  AVAILABLE: true,
  UNAVAILABLE: false
};

/**
 * Specialization categories (example - customize based on your needs)
 */
export const SpecializationCategories = {
  CARDIOLOGY: "Cardiology",
  DERMATOLOGY: "Dermatology",
  NEUROLOGY: "Neurology",
  PEDIATRICS: "Pediatrics",
  PSYCHIATRY: "Psychiatry",
  ORTHOPEDICS: "Orthopedics",
  OPHTHALMOLOGY: "Ophthalmology",
  GYNECOLOGY: "Gynecology",
  UROLOGY: "Urology",
  GENERAL_MEDICINE: "General Medicine"
};

export default Doctor;
