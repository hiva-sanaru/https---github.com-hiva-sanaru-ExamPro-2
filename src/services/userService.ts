
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where, addDoc, updateDoc, limit } from 'firebase/firestore';
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

export async function findUserByEmployeeId(employeeId: string): Promise<User | null> {
    const q = query(usersCollection, where("employeeId", "==", employeeId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }
    
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
}

export async function addUser(user: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(usersCollection, user);
    return docRef.id;
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    
    const dataToUpdate: { [key: string]: any } = { ...userData };

    // Do not allow employeeId to be updated
    delete dataToUpdate.employeeId;

    // Only include password in the update if it's explicitly provided and not an empty string
    if (!userData.password) {
        delete dataToUpdate.password;
    }
    
    await updateDoc(docRef, dataToUpdate);
}

export async function deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
}
