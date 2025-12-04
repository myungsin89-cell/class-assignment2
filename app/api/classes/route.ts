import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { school_id, grade, section_count } = await request.json();

        if (!school_id) {
            return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO classes (school_id, grade, section_count) VALUES (?, ?, ?)');
        const result = stmt.run(school_id, grade, section_count);

        return NextResponse.json({ id: result.lastInsertRowid, school_id, grade, section_count });
    } catch (error: any) {
        console.error('Error creating class:', error);
        return NextResponse.json({ error: 'Failed to create class', details: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const schoolId = searchParams.get('schoolId');

        if (!schoolId) {
            return NextResponse.json({ error: 'schoolId parameter is required' }, { status: 400 });
        }

        const stmt = db.prepare('SELECT * FROM classes WHERE school_id = ? ORDER BY created_at DESC');
        const classes = stmt.all(schoolId);

        return NextResponse.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        const schoolId = searchParams.get('schoolId');

        if (!classId || !schoolId) {
            return NextResponse.json({ error: 'classId and schoolId are required' }, { status: 400 });
        }

        // Verify that the class belongs to this school
        const verifyStmt = db.prepare('SELECT * FROM classes WHERE id = ? AND school_id = ?');
        const classData = verifyStmt.get(classId, schoolId);

        if (!classData) {
            return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 404 });
        }

        // Delete the class (students will be deleted automatically due to CASCADE)
        const deleteStmt = db.prepare('DELETE FROM classes WHERE id = ?');
        deleteStmt.run(classId);

        return NextResponse.json({ success: true, message: 'Class deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting class:', error);
        return NextResponse.json({ error: 'Failed to delete class', details: error.message }, { status: 500 });
    }
}
