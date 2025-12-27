
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Location from '@/models/Location';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { coordinates, accuracy, userId, userAgent } = body;

    if (!coordinates || !accuracy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newLocation = new Location({
      userId: userId || 'Vinu Varshith CP',
      location: {
        type: 'Point',
        coordinates: coordinates // [lng, lat]
      },
      accuracy,
      userAgent: userAgent || req.headers.get('user-agent'),
      timestamp: new Date()
    });

    await newLocation.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Location indexed successfully',
      id: newLocation._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database write failed' 
    }, { status: 500 });
  }
}
