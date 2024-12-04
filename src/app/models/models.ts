export interface Settings{
    userId: string,
    password: string,
    darkMode: boolean,
    noteIds: string[],
    labelIds: string[],
    autoLog: boolean
}

export interface ChecklistItem {
    id: string;
    order: number;
    text: string;
    checked: boolean;
}

export interface ImageAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
}

export interface Label {
    id: string;
    name: string;
    color: string;
    order: number;
}

export interface FirebaseAttachment {
    id: string;
    name: string;
    url: string;
    size: number;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    isChecklist: boolean;
    checklistItems: ChecklistItem[];
    color: string;
    isPinned: boolean;
    createdAt: Date;
    editAt: Date | null; 
    delete: boolean;
    attachments: ImageAttachment[];
    labels: Label[];  
    order: number;
}