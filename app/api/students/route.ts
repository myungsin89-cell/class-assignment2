import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { students, classId, section } = await request.json();

        const stmt = db.prepare(
            'INSERT INTO students (class_id, section_number, name, gender, is_problem_student, group_name) VALUES (?, ?, ?, ?, ?, ?)'
        );

        const insertMany = db.transaction((studentList: any[]) => {
            for (const student of studentList) {
                stmt.run(
                    classId,
                    section || 1,
                    student.name,
                    student.gender,
                    student.is_problem_student ? 1 : 0,
                    student.group_name || null
                );
            }
        });

        insertMany(students);

        return NextResponse.json({ success: true, count: students.length });
    } catch (error) {
        console.error('Error creating students:', error);
        return NextResponse.json({ error: 'Failed to create students' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const classId = searchParams.get('classId');
        const section = searchParams.get('section');

        if (!classId) {
            return NextResponse.json({ error: 'classId is required' }, { status: 400 });
        }

        let stmt;
        let students;

        if (section) {
            stmt = db.prepare('SELECT * FROM students WHERE class_id = ? AND section_number = ? ORDER BY id');
            students = stmt.all(classId, section);
        } else {
            stmt = db.prepare('SELECT * FROM students WHERE class_id = ? ORDER BY id');
            students = stmt.all(classId);
        }

        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        const stmt = db.prepare('DELETE FROM students WHERE id = ?');
        stmt.run(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }
}
