import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const stmt = db.prepare('SELECT * FROM classes WHERE id = ?');
        const classData = stmt.get(id) as any;

        if (!classData) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // 이 클래스로부터 생성된 분산 클래스(자식 클래스)가 있는지 확인
        const childStmt = db.prepare('SELECT id FROM classes WHERE parent_class_id = ? ORDER BY id DESC LIMIT 1');
        const childClass = childStmt.get(id) as any;

        if (childClass) {
            classData.child_class_id = childClass.id;
        }

        return NextResponse.json(classData);
    } catch (error) {
        console.error('Error fetching class:', error);
        return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { section, status } = body;

        if (!section || !status) {
            return NextResponse.json({ error: 'Section and status are required' }, { status: 400 });
        }

        // 현재 section_statuses 가져오기
        const stmt = db.prepare('SELECT section_statuses FROM classes WHERE id = ?');
        const classData = stmt.get(id) as any;

        if (!classData) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 });
        }

        // JSON 파싱
        let statuses: Record<string, string> = {};
        try {
            statuses = JSON.parse(classData.section_statuses || '{}');
        } catch (e) {
            statuses = {};
        }

        // 상태 업데이트
        statuses[section.toString()] = status;

        // DB 업데이트
        const updateStmt = db.prepare('UPDATE classes SET section_statuses = ? WHERE id = ?');
        updateStmt.run(JSON.stringify(statuses), id);

        return NextResponse.json({ success: true, section_statuses: statuses });
    } catch (error) {
        console.error('Error updating section status:', error);
        return NextResponse.json({ error: 'Failed to update section status' }, { status: 500 });
    }
}
