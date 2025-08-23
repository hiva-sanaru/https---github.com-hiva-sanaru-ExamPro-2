
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import type { Headquarters } from '@/lib/types';

const headquartersCollection = collection(db, 'headquarters');

export async function getHeadquarters(): Promise<Headquarters[]> {
    const snapshot = await getDocs(headquartersCollection);
    return snapshot.docs.map(doc => ({ ...doc.data(), code: doc.id } as Headquarters));
}

export async function addHeadquartersBatch(newHqs: Omit<Headquarters, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    newHqs.forEach(hq => {
        const docRef = doc(headquartersCollection, hq.code);
        batch.set(docRef, { name: hq.name, code: hq.code });
    });
    await batch.commit();
}

export async function deleteHeadquarters(code: string): Promise<void> {
    const docRef = doc(db, 'headquarters', code);
    await deleteDoc(docRef);
}
