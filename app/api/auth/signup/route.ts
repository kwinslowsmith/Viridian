import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuid();

    // Check if this is an admin invite (via admin-created flag)
    const isAdminInvite = request.headers.get('x-admin-invite') === 'true';

    // Create user (auto-verify if admin invite, otherwise set token for verification)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerificationToken: isAdminInvite ? null : verificationToken,
        emailVerified: isAdminInvite ? true : false,
      }
    });

    // Send verification email only if NOT an admin invite
    if (!isAdminInvite && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'noreply@viridian.dev',
          to: email,
          subject: 'Verify your email',
          html: `
            <p>Welcome to Viridian!</p>
            <p><a href="${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}">Verify your email</a></p>
          `
        });
      } catch (emailError) {
        console.warn('Failed to send verification email, but user was created:', emailError);
      }
    }

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
