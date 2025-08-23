
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import type { User } from '@/lib/types';

const usersCollection = collection(db, 'users');

export async function getUsers(): Promise<User[]> {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
}

export async function getUser(id: string): Promise<User | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
}

export async function addUser(user: Omit<User, 'id'>): Promise<string> {
    // employeeId should be the document id
    const docRef = doc(usersCollection, user.employeeId);
    await setDoc(docRef, user);
    return user.employeeId;
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, userData, { merge: true });
}

export async function deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
}
