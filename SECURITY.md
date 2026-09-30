# Security Policy & Deployment Checklist

This repository is built following defense-in-depth security principles.

## 🔐 Key Protections Implemented

1. **Role-Based Access Control (RBAC)**:
   - 4 discrete roles: `CUSTOMER`, `RESTAURANT`, `RIDER`, and `ADMIN`.
   - Enforced simultaneously on backend middleware (`requireRole`) and frontend route guards.
   - Resource-level ownership checks prevent unauthorized horizontal data access.

2. **Secrets & Tokens**:
   - Zero hardcoded production secrets. All keys load from environment variables via Zod-validated configs.
   - Passwords hashed using `bcrypt` (12 salt rounds).
   - Delivery OTPs are generated server-side with 4 digits, securely hashed, time-limited, and rate-limited against brute force.
   - JWT tokens are transmitted via `httpOnly`, `Secure`, `SameSite` cookies to prevent XSS credential theft.

3. **Input Sanitization & Validation**:
   - Strict `Zod` schemas validate every API endpoint request payload and query params.
   - Parameterized SQL queries executed via Prisma ORM preventing SQL injection.

4. **Network & API Security**:
   - `Helmet` security headers configured.
   - Strict `CORS` restricted strictly to configured client domains.
   - Rate limiting on sensitive endpoints (Login, OTP generation, order placement).

5. **Payment Security**:
   - Razorpay signature verification executes exclusively server-side using SHA256 HMAC.
   - No payment status from frontend is trusted without cryptographic verification.

---

## ⚠️ Pre-Deployment Rotation Checklist

Before deploying this repository to public production or switching from test mode:

- [ ] Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` to cryptographically random 256-bit keys.
- [ ] Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live production credentials.
- [ ] Ensure `NODE_ENV` is set to `production`.
- [ ] Update `CLIENT_URL` to your production frontend domain (e.g., `https://foodle.vercel.app`).
- [ ] Configure real SMTP credentials or a transactional email provider (e.g. Resend/Sendgrid).
- [ ] Set `CLOUDINARY_URL` / credentials for production asset hosting.
- [ ] Enable PostgreSQL connection pooling (PgBouncer) on Neon / Supabase.
