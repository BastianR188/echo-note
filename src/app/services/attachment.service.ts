import { Injectable } from '@angular/core';
import { ImageAttachment, Note } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  
  constructor() { }
  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  async handleFileSelection(fileList: FileList): Promise<ImageAttachment[]> {
    const attachments: ImageAttachment[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const attachment = await this.createImageAttachment(file);
      attachments.push(attachment);
    }
    return attachments;
  }

  private createImageAttachment(file: File): Promise<ImageAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve({
          id: this.generateUniqueId(),  // Füge die ID hinzu
          name: file.name,
          url: e.target.result,
          size: file.size
        });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  async addAttachmentsToNote(note: Note, fileList: FileList): Promise<void> {
    const newAttachments = await this.handleFileSelection(fileList);
    newAttachments.forEach(attachment => {
      note.attachments.push(attachment);
    });
  }

  removeAttachmentFromNote(note: Note, attachmentId: string): void {
    const index = note.attachments.findIndex(attachment => attachment.id === attachmentId);
    if (index !== -1) {
      note.attachments.splice(index, 1);
    }
  }
}