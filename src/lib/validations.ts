import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    organizationName: z.string().min(2, 'Organization name is required'),
    county: z.string().min(1, 'County is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions',
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const organizationProfileSchema = z.object({
    name: z.string().min(2, 'Organization name is required'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    county: z.string().min(1, 'County is required'),
    subCounty: z.string().optional(),
    address: z.string().optional(),
    registrationNumber: z.string().optional(),
    yearEstablished: z.number().min(1900).max(new Date().getFullYear()).optional(),
    staffSize: z.string().optional(),
    annualBudget: z.string().optional(),
    sectors: z.array(z.string()).min(1, 'Select at least one sector'),
    sdgs: z.array(z.number()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrganizationProfileInput = z.infer<typeof organizationProfileSchema>;
