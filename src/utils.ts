import type { EventStatus } from './api/event/event.dto';

export function renderStatusChip(status: EventStatus) {
    if (status === 'Ongoing') return 'success'
    if (status === 'Completed') return 'default'
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}