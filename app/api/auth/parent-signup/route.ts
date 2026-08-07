import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate email verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create user with role "parent" (using the role field temporarily)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: hashedPassword,
        role: 'parent', // Will be stored here until NextAuth migration
        emailVerificationToken: verificationToken,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // TODO: Send verification email with verificationToken
    // For now, return the token so frontend can use it in development
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({
      success: true,
      message: 'Parent account created. Please verify your email.',
      userId: user.id,
      email: user.email,
      verificationUrl: process.env.NODE_ENV === 'development' ? verificationUrl : undefined,
    });
  } catch (error) {
    console.error('Error creating parent account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
