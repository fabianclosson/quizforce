/**
 * Comprehensive tests for the centralized validation system
 * Tests Zod v4 compatibility and validation patterns
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import {
  Validators,
  ValidationUtils,
  XSSPrevention,
  FileValidation,
  ValidationError,
  ValidationResult,
} from '@/lib/validators';

describe('Centralized Validation System', () => {
  describe('ValidationPatterns', () => {
    it('should validate email addresses correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        '',
      ];

      validEmails.forEach(email => {
        const result = Validators.Patterns.email.safeParse(email);
        expect(result.success).toBe(true);
      });

      invalidEmails.forEach(email => {
        const result = Validators.Patterns.email.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should validate passwords with security requirements', () => {
      const validPasswords = [
        'StrongPass1!',
        'MySecure123@',
        'Complex#Pass9',
      ];

      const invalidPasswords = [
        'weak',
        'NoNumbers!',
        'nonumbersupper!',
        'NOLOWERCASE1!',
        'NoSpecialChar1',
        '1234567', // too short
      ];

      validPasswords.forEach(password => {
        const result = Validators.Patterns.password.safeParse(password);
        expect(result.success).toBe(true);
      });

      invalidPasswords.forEach(password => {
        const result = Validators.Patterns.password.safeParse(password);
        expect(result.success).toBe(false);
      });
    });

    it('should validate IP addresses correctly', () => {
      const validIPs = [
        '192.168.1.1',
        '127.0.0.1',
        '255.255.255.255',
        '::1',
        '2001:db8::1',
      ];

      const invalidIPs = [
        '256.1.1.1',
        '192.168.1',
        'not-an-ip',
        '',
      ];

      validIPs.forEach(ip => {
        const result = Validators.Patterns.ipAddress.safeParse(ip);
        expect(result.success).toBe(true);
      });

      invalidIPs.forEach(ip => {
        const result = Validators.Patterns.ipAddress.safeParse(ip);
        expect(result.success).toBe(false);
      });
    });

    it('should validate UUIDs correctly', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      const invalidUUIDs = [
        'not-a-uuid',
        '550e8400-e29b-41d4-a716',
        '',
        '123456789',
      ];

      validUUIDs.forEach(uuid => {
        const result = Validators.Patterns.uuid.safeParse(uuid);
        expect(result.success).toBe(true);
      });

      invalidUUIDs.forEach(uuid => {
        const result = Validators.Patterns.uuid.safeParse(uuid);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('AuthValidators', () => {
    it('should validate registration data correctly', () => {
      const validRegistration = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      };

      const result = Validators.Auth.register.safeParse(validRegistration);
      expect(result.success).toBe(true);
    });

    it('should reject registration with mismatched passwords', () => {
      const invalidRegistration = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true,
      };

      const result = Validators.Auth.register.safeParse(invalidRegistration);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('confirmPassword')
        )).toBe(true);
      }
    });

    it('should validate login data correctly', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = Validators.Auth.login.safeParse(validLogin);
      expect(result.success).toBe(true);
    });
  });

  describe('CourseValidators', () => {
    it('should validate certification data correctly', () => {
      const validCertification = {
        title: 'Salesforce Administrator',
        description: 'Learn Salesforce administration basics',
        level: 'BEGINNER' as const,
        price: 199.99,
        duration: 120,
        passingScore: 70,
        status: 'ACTIVE' as const,
        tags: ['salesforce', 'admin'],
      };

      const result = Validators.Course.certification.safeParse(validCertification);
      expect(result.success).toBe(true);
    });

    it('should validate knowledge area data correctly', () => {
      const validKnowledgeArea = {
        name: 'User Management',
        description: 'Learn about managing users in Salesforce',
        certification_id: '550e8400-e29b-41d4-a716-446655440000',
        weight_percentage: 25,
        sort_order: 1,
      };

      const result = Validators.Course.knowledgeArea.safeParse(validKnowledgeArea);
      expect(result.success).toBe(true);
    });

    it('should validate question data correctly', () => {
      const validQuestion = {
        text: 'What is the maximum number of custom fields per object?',
        type: 'MULTIPLE_CHOICE' as const,
        options: ['500', '800', '1000', '1200'],
        correctAnswer: '800',
        explanation: 'Salesforce allows up to 800 custom fields per object.',
        difficulty: 'MEDIUM' as const,
        points: 10,
        difficulty_level: 'MEDIUM' as const,
        question_number: 1,
        required_selections: 1,
      };

      const result = Validators.Course.question.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });
  });

  describe('PaymentValidators', () => {
    it('should validate checkout data correctly', () => {
      const validCheckout = {
        certificationId: '550e8400-e29b-41d4-a716-446655440000',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const result = Validators.Payment.checkout.safeParse(validCheckout);
      expect(result.success).toBe(true);
    });

    it('should require either certificationId or packageId', () => {
      const invalidCheckout = {
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const result = Validators.Payment.checkout.safeParse(invalidCheckout);
      expect(result.success).toBe(false);
    });
  });

  describe('ValidationUtils', () => {
    it('should validate data successfully with valid input', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      const validData = { name: 'John', age: 25 };
      const result = ValidationUtils.validate(schema, validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return validation errors with invalid input', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0),
      });

      const invalidData = { name: '', age: -1 };
      const result = ValidationUtils.validate(schema, invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should extract Zod errors correctly', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      try {
        schema.parse({ email: 'invalid', password: '123' });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const extractedErrors = ValidationUtils.extractZodErrors(error);
          
          expect(extractedErrors).toBeDefined();
          expect(extractedErrors.length).toBeGreaterThan(0);
          expect(extractedErrors.every(err => 
            typeof err.field === 'string' && 
            typeof err.message === 'string'
          )).toBe(true);
        }
      }
    });

    it('should format errors for API responses', () => {
      const errors: ValidationError[] = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' },
        { field: 'password', message: 'Missing special character' },
      ];

      const formatted = ValidationUtils.formatErrorsForResponse(errors);

      expect(formatted).toEqual({
        email: ['Invalid email'],
        password: ['Password too short', 'Missing special character'],
      });
    });
  });

  describe('XSSPrevention', () => {
    it('should sanitize HTML content correctly', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = XSSPrevention.sanitizeHtml(maliciousHtml);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe content');
    });

    it('should sanitize text content by removing all HTML', () => {
      const htmlText = '<p>Hello <strong>world</strong></p>';
      const sanitized = XSSPrevention.sanitizeText(htmlText);

      expect(sanitized).not.toContain('<p>');
      expect(sanitized).not.toContain('<strong>');
      expect(sanitized).toContain('Hello world');
    });

    it('should sanitize dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert("xss")</script>',
        'vbscript:msgbox("xss")',
      ];

      dangerousUrls.forEach(url => {
        const sanitized = XSSPrevention.sanitizeUrl(url);
        expect(sanitized).toBe('#');
      });
    });

    it('should preserve safe URLs', () => {
      const safeUrls = [
        'https://example.com',
        'http://localhost:3000',
        '/relative/path',
        'mailto:user@example.com',
      ];

      safeUrls.forEach(url => {
        const sanitized = XSSPrevention.sanitizeUrl(url);
        expect(sanitized).toBe(url);
      });
    });

    it('should escape HTML entities correctly', () => {
      const text = '<script>alert("test")</script>';
      const escaped = XSSPrevention.escapeHtml(text);

      expect(escaped).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    });
  });

  describe('FileValidation', () => {
    it('should validate file schema correctly', () => {
      const validFile = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
      };

      const result = FileValidation.fileSchema.safeParse(validFile);
      expect(result.success).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeFile = {
        name: 'large-file.pdf',
        size: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
        type: 'application/pdf',
      };

      const result = FileValidation.fileSchema.safeParse(largeFile);
      expect(result.success).toBe(false);
    });

    it('should reject invalid file types', () => {
      const invalidFile = {
        name: 'script.exe',
        size: 1024,
        type: 'application/x-executable',
      };

      const result = FileValidation.fileSchema.safeParse(invalidFile);
      expect(result.success).toBe(false);
    });
  });

  describe('EnumValidators', () => {
    it('should validate certification levels correctly', () => {
      const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
      const invalidLevels = ['EXPERT', 'NOVICE', ''];

      validLevels.forEach(level => {
        const result = Validators.Enums.certificationLevel.safeParse(level);
        expect(result.success).toBe(true);
      });

      invalidLevels.forEach(level => {
        const result = Validators.Enums.certificationLevel.safeParse(level);
        expect(result.success).toBe(false);
      });
    });

    it('should validate user roles correctly', () => {
      const validRoles = ['USER', 'ADMIN', 'MODERATOR'];
      const invalidRoles = ['SUPER_ADMIN', 'GUEST', ''];

      validRoles.forEach(role => {
        const result = Validators.Enums.userRole.safeParse(role);
        expect(result.success).toBe(true);
      });

      invalidRoles.forEach(role => {
        const result = Validators.Enums.userRole.safeParse(role);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Zod v4 Compatibility', () => {
    it('should handle error messages correctly in Zod v4', () => {
      const schema = z.string({ message: 'Custom error message' });
      
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Custom error message');
      }
    });

    it('should work with z.record() in Zod v4', () => {
      const schema = z.record(z.string(), z.number());
      const validData = { a: 1, b: 2, c: 3 };
      const invalidData = { a: 1, b: 'invalid', c: 3 };

      const validResult = schema.safeParse(validData);
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse(invalidData);
      expect(invalidResult.success).toBe(false);
    });

    it('should handle refinements correctly in Zod v4', () => {
      const schema = z.string()
        .refine(val => val.length > 5, 'String must be longer than 5 characters');

      const validResult = schema.safeParse('valid string');
      expect(validResult.success).toBe(true);

      const invalidResult = schema.safeParse('short');
      expect(invalidResult.success).toBe(false);
      
      if (!invalidResult.success) {
        expect(invalidResult.error.issues[0].message).toBe('String must be longer than 5 characters');
      }
    });
  });

  describe('Integration Tests', () => {
    it('should work with React Hook Form patterns', () => {
      // Test the type inference works correctly
      type LoginFormData = z.infer<typeof Validators.Auth.login>;
      
      const formData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = Validators.Auth.login.safeParse(formData);
      expect(result.success).toBe(true);
    });

    it('should work with API validation patterns', () => {
      const apiSchema = Validators.Admin.packageUpdate.extend({
        customField: z.string().optional(),
      });

      const validData = {
        title: 'Updated Package',
        description: 'Updated description',
        price: 299.99,
        status: 'ACTIVE' as const,
        customField: 'custom value',
      };

      const result = apiSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
}); 