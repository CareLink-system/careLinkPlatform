// feature/userManagement/entity/user.entity.js

/**
 * User Entity class for frontend
 * Represents the user model based on backend ApplicationUser and DTOs
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || "";
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.titles = data.titles || null;
    this.role = data.role || "Patient";
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
    this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : null;
    this.lastLoginIp = data.lastLoginIp || null;
    this.phoneNumber = data.phoneNumber || null;
    this.designation = data.designation || null;
    this.img = data.img || null;
    this.signature = data.signature || null;
    this.fullName = data.fullName || null;
    this.refreshToken = data.refreshToken || null;
    this.refreshTokenExpireTime = data.refreshTokenExpireTime
      ? new Date(data.refreshTokenExpireTime)
      : null;
  }

  /**
   * Get user's full name
   * @returns {string}
   */
  getFullName() {
    const nameParts = [];
    if (this.titles) nameParts.push(this.titles);
    if (this.firstName) nameParts.push(this.firstName);
    if (this.lastName) nameParts.push(this.lastName);
    return nameParts.join(" ") || "Unknown User";
  }

  /**
   * Get display name (first name + last name)
   * @returns {string}
   */
  getDisplayName() {
    return `${this.firstName} ${this.lastName}`.trim() || this.email;
  }

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.role?.toLowerCase() === "admin";
  }

  /**
   * Check if user is doctor
   * @returns {boolean}
   */
  isDoctor() {
    return this.role?.toLowerCase() === "doctor";
  }

  /**
   * Check if user is patient
   * @returns {boolean}
   */
  isPatient() {
    return this.role?.toLowerCase() === "patient";
  }

  /**
   * Check if user account is active
   * @returns {boolean}
   */
  isAccountActive() {
    return this.isActive === true;
  }

  /**
   * Check if refresh token is valid
   * @returns {boolean}
   */
  hasValidRefreshToken() {
    return (
      !!this.refreshToken &&
      this.refreshTokenExpireTime &&
      this.refreshTokenExpireTime > new Date()
    );
  }

  /**
   * Convert to JSON for API requests
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      titles: this.titles,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString(),
      lastLoginIp: this.lastLoginIp,
      phoneNumber: this.phoneNumber,
      designation: this.designation,
      img: this.img,
      signature: this.signature,
      fullName: this.fullName
    };
  }

  /**
   * Create User instance from UserResponseDto
   * @param {Object} responseDto - UserResponseDto from API
   * @returns {User}
   */
  static fromResponseDto(responseDto) {
    return new User(responseDto);
  }

  /**
   * Create User instance from UserProfileDto
   * @param {Object} profileDto - UserProfileDto from API
   * @returns {User}
   */
  static fromProfileDto(profileDto) {
    return new User(profileDto);
  }

  /**
   * Create User instance from paginated response
   * @param {Object} paginatedResponse - PaginatedUserResponse from API
   * @returns {Object} - Object containing users array and pagination info
   */
  static fromPaginatedResponse(paginatedResponse) {
    return {
      users: (paginatedResponse.users || []).map((user) => new User(user)),
      pageNumber: paginatedResponse.pageNumber,
      pageSize: paginatedResponse.pageSize,
      totalCount: paginatedResponse.totalCount,
      totalPages: paginatedResponse.totalPages
    };
  }

  /**
   * Create payload for user creation (UserCreateDto)
   * @returns {Object}
   */
  toCreatePayload() {
    return {
      email: this.email,
      password: this.password, // Note: password needs to be set separately
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      phoneNumber: this.phoneNumber
    };
  }

  /**
   * Create payload for user update (UserUpdateDto)
   * @returns {Object}
   */
  toUpdatePayload() {
    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber
    };

    if (this.role) payload.role = this.role;
    if (this.titles) payload.titles = this.titles;
    if (this.designation) payload.designation = this.designation;
    if (this.isActive !== undefined) payload.isActive = this.isActive;
    if (this.fullName) payload.fullName = this.fullName;

    return payload;
  }

  /**
   * Create payload for profile update (UpdateProfileRequest / UpdateCurrentUserRequest)
   * @returns {Object}
   */
  toProfileUpdatePayload() {
    const payload = {};
    if (this.firstName) payload.firstName = this.firstName;
    if (this.lastName) payload.lastName = this.lastName;
    if (this.titles) payload.titles = this.titles;
    return payload;
  }

  /**
   * Create payload for full user update (UpdateUserDto)
   * @returns {Object}
   */
  toFullUpdatePayload() {
    const payload = {
      firstName: this.firstName,
      lastName: this.lastName
    };

    if (this.phoneNumber) payload.phoneNumber = this.phoneNumber;
    if (this.designation) payload.designation = this.designation;
    if (this.img) payload.img = this.img;
    if (this.signature) payload.signature = this.signature;

    return payload;
  }

  /**
   * Create payload for registration (UserRegisterDto)
   * @returns {Object}
   */
  toRegisterPayload() {
    const payload = {
      email: this.email,
      password: this.password, // Note: password needs to be set separately
      firstName: this.firstName,
      lastName: this.lastName
    };

    if (this.titles) payload.titles = this.titles;
    if (this.role) payload.role = this.role;

    return payload;
  }

  /**
   * Create payload for refresh token request
   * @returns {Object}
   */
  toRefreshTokenPayload() {
    return {
      refreshToken: this.refreshToken
    };
  }

  /**
   * Create payload for password change
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object}
   */
  static toChangePasswordPayload(currentPassword, newPassword) {
    return {
      currentPassword,
      newPassword
    };
  }

  /**
   * Clone the user instance
   * @returns {User}
   */
  clone() {
    return new User(this.toJSON());
  }

  /**
   * Update user properties from object
   * @param {Object} updates - Partial user data
   */
  update(updates) {
    Object.assign(this, updates);
    if (updates.createdAt) this.createdAt = new Date(updates.createdAt);
    if (updates.updatedAt) this.updatedAt = new Date(updates.updatedAt);
    if (updates.lastLoginAt) this.lastLoginAt = new Date(updates.lastLoginAt);
    if (updates.refreshTokenExpireTime)
      this.refreshTokenExpireTime = new Date(updates.refreshTokenExpireTime);
    return this;
  }
}

/**
 * Validation helper functions for user data
 */
export const UserValidators = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password) => {
    return password && password.length >= 6;
  },

  isValidRole: (role) => {
    const validRoles = ["Patient", "Doctor", "Admin"];
    return validRoles.includes(role);
  },

  isRequired: (value) => {
    return (
      value !== null && value !== undefined && value.toString().trim() !== ""
    );
  }
};

/**
 * User roles constants
 */
export const UserRoles = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  ADMIN: "Admin"
};

/**
 * Titles constants
 */
export const UserTitles = {
  MR: "Mr",
  MRS: "Mrs",
  MS: "Ms",
  DR: "Dr",
  PROF: "Prof"
};

export default User;
