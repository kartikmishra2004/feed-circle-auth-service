import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  role: z.enum(['individual', 'organization'], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either 'individual' or 'organization'"
  }),
  // Fields for individual users
  fullName: z.string()
    .min(1, "Full name is required")
    .max(60, "Full name cannot exceed 60 characters")
    .trim()
    .optional(),

  // Fields for organization users
  organizationName: z.string()
    .min(1, "Organization name is required")
    .max(100, "Organization name cannot exceed 100 characters")
    .trim()
    .optional(),
  organizationType: z.string()
    .min(1, "Organization type is required")
    .trim()
    .optional(),
  contactPersonName: z.string()
    .min(1, "Contact person name is required")
    .max(60, "Contact person name cannot exceed 60 characters")
    .trim()
    .optional(),
  phone: z.string()
    .min(1, "Phone number is required")
    .optional(),
}).refine((data) => {
  // Validation for individual role
  if (data.role === 'individual') {
    return data.fullName && data.fullName.length > 0;
  }
  return true;
}, {
  message: "Full name is required for individual users",
  path: ["fullName"]
}).refine((data) => {
  // Validation for organization role
  if (data.role === 'organization') {
    return data.organizationName &&
      data.organizationType &&
      data.contactPersonName &&
      data.phone &&
      data.organizationName.length > 0 &&
      data.organizationType.length > 0 &&
      data.contactPersonName.length > 0 &&
      data.phone.length > 0;
  }
  return true;
}, {
  message: "Organization name, type, contact person name, and phone are required for organization users",
  path: ["organizationName"]
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});
