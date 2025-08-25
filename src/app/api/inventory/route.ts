
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InventoryItem } from '@/lib/types';
import { headers } from 'next/headers';

const validateApiKey = (requestHeaders: Headers): boolean => {
    const apiKey = requestHeaders.get('x-api-key');
    return apiKey === process.env.API_SECRET_KEY;
}

// GET all inventory items
export async function GET(request: Request) {
    if (!validateApiKey(headers())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const inventoryCollection = collection(db, 'inventory');
        const snapshot = await getDocs(inventoryCollection);
        const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(inventory);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch inventory', details: error.message }, { status: 500 });
    }
}


// POST a new inventory item
export async function POST(request: Request) {
    if (!validateApiKey(headers())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const itemData = await request.json();
        
        // Basic validation
        if (!itemData.id || !itemData.name) {
            return NextResponse.json({ error: 'Missing required fields: id and name' }, { status: 400 });
        }

        const itemDocRef = doc(db, 'inventory', itemData.id);

        const docSnap = await getDoc(itemDocRef);
        if (docSnap.exists()) {
            return NextResponse.json({ error: `Item with SKU ${itemData.id} already exists.`}, { status: 409 });
        }

        const newItem: InventoryItem = {
            id: itemData.id,
            name: itemData.name,
            brand: itemData.brand || '',
            category: itemData.category || 'Uncategorized',
            unit: itemData.unit || 'pcs',
            quantity: Number(itemData.quantity) || 0,
            min_stock: Number(itemData.min_stock) || 0,
            max_stock: Number(itemData.max_stock) || 0,
            image: itemData.image || 'https://placehold.co/400x400.png',
            last_updated: new Date().toISOString(),
        };

        await setDoc(itemDocRef, newItem);
        
        // TODO: Optionally add to incoming_logs

        return NextResponse.json(newItem, { status: 201 });

    } catch (error: any) {
         return NextResponse.json({ error: 'Failed to create item', details: error.message }, { status: 500 });
    }
}
