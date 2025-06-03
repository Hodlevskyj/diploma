import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
	const date =
		typeof dateString === 'string' ? new Date(dateString) : dateString
	return date.toLocaleDateString('uk-UA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}
