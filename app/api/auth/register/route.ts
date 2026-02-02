import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { signToken, setAuthCookie } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Get database
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if username exists
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if this is the first user (will be admin)
    const userCount = await usersCollection.countDocuments();
    const isFirstUser = userCount === 0;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser: Omit<User, '_id'> = {
      username,
      passwordHash,
      isAdmin: isFirstUser,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as any);

    // Generate JWT token
    const token = signToken({
      userId: result.insertedId.toString(),
      username,
      isAdmin: isFirstUser,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.insertedId.toString(),
          username,
          isAdmin: isFirstUser,
        },
        message: isFirstUser ? 'Account created as admin (first user)' : 'Account created successfully',
      },
    });

    // Set HTTP-only cookie
    const cookieOptions = setAuthCookie(token);
    response.cookies.set(cookieOptions);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
