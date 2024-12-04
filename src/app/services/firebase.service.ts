import { FirebaseAttachment, ImageAttachment, Label, Note, Settings } from '../models/models';
import { NoteService } from './note.service';
import { LabelService } from './label.service';
import { collection, doc, documentId, Firestore, getDoc, getDocs, query, setDoc, Timestamp, where } from '@angular/fire/firestore';
import { Injectable, inject } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    firestore: Firestore = inject(Firestore);
    constructor(private noteService: NoteService, private labelService: LabelService) {
    }

    async saveUserData(settings: Settings) {
        const userDocRef = doc(this.firestore, "userId", settings.userId);
        const notesCollectionRef = collection(this.firestore, "notes");
        const labelsCollectionRef = collection(this.firestore, "labels");
        try {
            try {
                let userData = this.noteService.getAllDataId(settings);

                // Validierung der userData
                if (!userData || Object.keys(userData).length === 0) {
                    throw new Error('No user data to save');
                }

                // Optional: Logging der zu speichernden Daten

                // Speichern der Daten mit Merge-Option
                await setDoc(userDocRef, userData, { merge: true });

            } catch (error) {
                console.error('Error saving user data:', error);
                // Sie könnten hier auch den Fehler weiterwerfen, wenn Sie möchten
                // throw error;
            }


            const notesPromises = this.noteService.notes.map(async (note: Note) => {
                try {
                    if (!note.id) {
                        throw new Error('Note ID is missing');
                    }

                    const noteToSave = { ...note };

                    // Überprüfen Sie, ob die Anhänge verarbeitet werden müssen
                    if (note.attachments && note.attachments.length > 0) {
                        noteToSave.attachments = await this.processAttachmentsToFirebase(note.attachments, settings.userId);
                    }

                    const noteDocRef = doc(notesCollectionRef, noteToSave.id);
                    await setDoc(noteDocRef, noteToSave);

                } catch (error) {
                    console.error(`Error saving note ${note.id}:`, error);
                    // Sie könnten hier auch den Fehler weiterwerfen, wenn Sie möchten, dass der gesamte Speichervorgang fehlschlägt
                    // throw error;
                }
            });


            // Labels speichern
            const labelsPromises = this.labelService.labels.map(async (label: Label) => {
                try {
                    if (!label.id) {
                        throw new Error('Label ID is missing');
                    }

                    const labelToSave = { ...label };

                    if (labelToSave.order === undefined) {
                        labelToSave.order = 0;
                    }

                    // Weitere Validierungen hier...

                    const labelDocRef = doc(labelsCollectionRef, labelToSave.id);
                    await setDoc(labelDocRef, labelToSave);
                } catch (error) {
                    console.error(`Error saving label ${label.id}:`, error);
                    // Sie könnten hier auch den Fehler weiterwerfen, wenn Sie möchten, dass der gesamte Speichervorgang fehlschlägt
                    // throw error;
                }
            });


            // Warten, bis alle Notes und Labels gespeichert sind
            await Promise.all([...notesPromises, ...labelsPromises]);
        } catch (e) {
            console.error("Error saving data:", e);
        }
    }



    private async processAttachmentsToFirebase(attachments: ImageAttachment[], userId: string): Promise<FirebaseAttachment[]> {
        return Promise.all(attachments.map(async (attachment) => {
            try {
                if (attachment.url.startsWith('data:')) {
                    const path = `/attachments/${userId}/${attachment.id}`;
                    const storage = getStorage();
                    const storageRef = ref(storage, path);
                

                    // Konvertiere base64 zu Blob
                    const response = await fetch(attachment.url);
                    const blob = await response.blob();

                    await uploadBytes(storageRef, blob);
                    const downloadUrl = await getDownloadURL(storageRef);

                    return {
                        id: attachment.id,
                        name: attachment.name,
                        url: downloadUrl,
                        size: attachment.size
                    };
                } else {
                    return attachment as FirebaseAttachment;
                }
            } catch (error) {
                console.error(`Error processing attachment ${attachment.id}:`, error);
                throw error;
            }
        }));
    }


    async getUserDataAndRelatedItems(userId: string) {
        try {
            // 1. Benutzerdaten abrufen
            const userDocRef = doc(this.firestore, "userId", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                console.log("Keine Benutzerdaten gefunden!");
                return null;
            }

            const userData = userDocSnap.data() as Settings;
            // 2. Notizen abrufen
            const notes: Note[] = await this.getNotesByIds(userData.noteIds, "notes");

            // 3. Labels abrufen
            const labels: Label[] = await this.getLabelsByIds(userData.labelIds, "labels");

            // 4. DarkMode abrufen
            const darkMode: boolean = userData.darkMode || false;
            return {
                userData,
                notes,
                labels,
                darkMode,
            };

        } catch (error) {
            console.error("Fehler beim Abrufen der Daten:", error);
            return null;
        }
    }

    async setNote(note: any) {
        const setNote: Note = {
            id: note.id,
            title: note.title,
            content: note.content,
            isChecklist: note.isChecklist,
            checklistItems: note.checklistItems,
            color: note.color,
            isPinned: note.isPinned,
            attachments: await this.processAttachments(note.attachments),
            createdAt: this.formatTimestamp(note.createdAt),
            editAt: this.formatTimestamp(note.editAt),
            delete: note.delete,
            labels: note.labels,
            order: note.order
        };
        return setNote;
    }

    private async processAttachments(attachments: any[]): Promise<ImageAttachment[]> {
        if (!attachments) return [];

        return Promise.all(attachments.map(async (attachment) => {
            if (typeof attachment.url === 'string' && !attachment.url.startsWith('data:')) {
                // Dies ist eine Firebase Storage URL, wir müssen sie nicht ändern
                return attachment as ImageAttachment;
            } else {
                // Hier können Sie zusätzliche Logik hinzufügen, falls nötig
                return attachment as ImageAttachment;
            }
        }));
    }
    private formatTimestamp(timestamp: Timestamp | undefined): Date {
        if (!timestamp || !(timestamp instanceof Timestamp)) {
            return new Date();
        }

        return timestamp.toDate();
    }

    setLabel(label: any) {
        const setLabel: Label = {
            id: label.id,
            name: label.name,
            color: label.color,
            order: label.order
        };
        return setLabel
    }

    private async getNotesByIds(ids: string[], col: string): Promise<Note[]> {
        if (!ids || ids.length === 0) return [];
    
        const docRef = collection(this.firestore, col);
        const q = query(docRef, where(documentId(), 'in', ids));
    
        const querySnapshot = await getDocs(q);
        return Promise.all(querySnapshot.docs.map(async doc => {
            const data = doc.data();
            return await this.setNote(data);
        }));
    }
    
    private async getLabelsByIds(ids: string[], col: string): Promise<Label[]> {
        if (!ids || ids.length === 0) return [];
    
        const docRef = collection(this.firestore, col);
        const q = query(docRef, where(documentId(), 'in', ids));
    
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return this.setLabel(data);
        });
    }

}

