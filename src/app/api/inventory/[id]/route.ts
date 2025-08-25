
import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { headers } from 'next/headers';

const validateApiKey = (requestHeaders: Headers): boolean => {
    const apiKey = requestHeaders.get('x-api-key');
    return apiKey === process.env.API_SECRET_KEY;
}

// GET a single inventory item by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    if (!validateApiKey(headers())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const itemDoc = await getDoc(doc(db, 'inventory', params.id));
        if (!itemDoc.exists()) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        return NextResponse.json({ id: itemDoc.id, ...itemDoc.data() });
    } catch (error: any) {
         return NextResponse.json({ error: 'Failed to fetch item', details: error.message }, { status: 500 });
    }
}


// PUT (update) an inventory item by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
     if (!validateApiKey(headers())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const itemRef = doc(db, 'inventory', params.id);
        const itemDoc = await getDoc(itemRef);

        if (!itemDoc.exists()) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const updateData = await request.json();
        
        // Ensure last_updated is always set
        updateData.last_updated = new Date().toISOString();

        await updateDoc(itemRef, updateData);
        
        // TODO: Optionally add to incoming_logs or retrieval_logs if quantity changes

        const updatedDoc = await getDoc(itemRef);
        return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update item', details: error.message }, { status: 500 });
    }
}


// DELETE an inventory item by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!validateApiKey(headers())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const itemRef = doc(db, 'inventory', params.id);
        const itemDoc = await getDoc(itemRef);

        if (!itemDoc.exists()) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await deleteDoc(itemRef);
        
        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });

    } catch (error: any) {
         return NextResponse.json({ error: 'Failed to delete item', details: error.message }, { status: 500 });
    }
}
