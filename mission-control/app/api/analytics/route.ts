import { NextRequest, NextResponse } from 'next/server';
import { getOrgAnalytics, getActivityFeed } from '@/lib/analytics';

// GET /api/analytics?org_id=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('org_id');
    const type = request.nextUrl.searchParams.get('type') || 'overview';
    
    if (!orgId) {
      return NextResponse.json({ error: 'org_id required' }, { status: 400 });
    }
    
    if (type === 'activity') {
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
      const { activities, error } = await getActivityFeed(orgId, limit);
      if (error) throw error;
      return NextResponse.json({ activities });
    }
    
    const analytics = await getOrgAnalytics(orgId);
    
    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
