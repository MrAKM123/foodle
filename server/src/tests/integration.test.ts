import { describe, it, expect } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { prisma } from '../config/db.js';

describe('Phase 1: End-to-End Auth & Role Engine Integration Tests', () => {
  it('should verify seeded Admin account exists and has ADMIN role', async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@foodle.app' },
    });
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe('ADMIN');
    expect(admin?.isEmailVerified).toBe(true);
  });

  it('should verify seeded Customer account exists with saved addresses', async () => {
    const customer = await prisma.user.findUnique({
      where: { email: 'customer@foodle.app' },
      include: { addresses: true },
    });
    expect(customer).not.toBeNull();
    expect(customer?.role).toBe('CUSTOMER');
    expect(customer?.addresses.length).toBeGreaterThan(0);
    expect(customer?.addresses[0].lat).toBeDefined();
    expect(customer?.addresses[0].lng).toBeDefined();
  });

  it('should verify seeded Restaurant Partner exists with menu items', async () => {
    const partner = await prisma.user.findUnique({
      where: { email: 'partner@delhidarbar.com' },
      include: {
        restaurants: {
          include: {
            categories: {
              include: { menuItems: true },
            },
          },
        },
      },
    });
    expect(partner).not.toBeNull();
    expect(partner?.role).toBe('RESTAURANT');
    expect(partner?.restaurants.length).toBe(1);
    expect(partner?.restaurants[0].categories.length).toBeGreaterThan(0);
    expect(partner?.restaurants[0].categories[0].menuItems.length).toBeGreaterThan(0);
  });

  it('should verify seeded Rider exists with RiderProfile', async () => {
    const rider = await prisma.user.findUnique({
      where: { email: 'rider@foodle.app' },
      include: { riderProfile: true },
    });
    expect(rider).not.toBeNull();
    expect(rider?.role).toBe('RIDER');
    expect(rider?.riderProfile).not.toBeNull();
    expect(rider?.riderProfile?.documentsVerified).toBe(true);
  });

  it('should successfully login customer with valid credentials', async () => {
    const { user, tokens } = await AuthService.login('customer@foodle.app', 'Demo@123');
    expect(user.email).toBe('customer@foodle.app');
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should register a new customer and generate a 6-digit verification OTP', async () => {
    const testEmail = `foodie_${Date.now()}@example.com`;
    const { user, tokens, otpSent } = await AuthService.register({
      name: 'Rohan Mehra',
      email: testEmail,
      password: 'StrongPassword@123',
      role: 'CUSTOMER',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.isEmailVerified).toBe(false);
    expect(user.emailOtp).toHaveLength(6);
    expect(otpSent).toBe(true);
    expect(tokens.accessToken).toBeDefined();

    // Verify OTP
    const verification = await AuthService.verifyOtp(testEmail, user.emailOtp!);
    expect(verification.user.isEmailVerified).toBe(true);
  });
});
