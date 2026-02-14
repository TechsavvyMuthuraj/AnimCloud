// File categorization utilities

export type FileCategory = 'images' | 'videos' | 'audio' | 'docs' | 'archives' | 'code' | 'executables' | 'other';

export interface FileCategoryConfig {
    id: FileCategory;
    label: string;
    icon: string;
    extensions: string[];
    color: string;
    bgColor: string;
}

export const FILE_CATEGORIES: Record<FileCategory, FileCategoryConfig> = {
    images: {
        id: 'images',
        label: 'Images',
        icon: '🖼️',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'heic'],
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
    },
    videos: {
        id: 'videos',
        label: 'Videos',
        icon: '🎬',
        extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', 'mpeg', 'mpg'],
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    },
    audio: {
        id: 'audio',
        label: 'Audio',
        icon: '🎵',
        extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'],
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
    },
    docs: {
        id: 'docs',
        label: 'Documents',
        icon: '📄',
        extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    archives: {
        id: 'archives',
        label: 'Archives',
        icon: '📦',
        extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'],
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    },
    code: {
        id: 'code',
        label: 'Code',
        icon: '💻',
        extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'json', 'xml', 'yaml', 'yml'],
        color: 'text-green-600',
        bgColor: 'bg-green-50'
    },
    executables: {
        id: 'executables',
        label: 'Executables',
        icon: '⚙️',
        extensions: ['exe', 'msi', 'app', 'dmg', 'deb', 'rpm', 'apk', 'jar'],
        color: 'text-red-600',
        bgColor: 'bg-red-50'
    },
    other: {
        id: 'other',
        label: 'Other',
        icon: '📁',
        extensions: [],
        color: 'text-slate-600',
        bgColor: 'bg-slate-50'
    }
};

// Get file extension from filename
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1].toLowerCase();
}

// Categorize file based on extension
export function categorizeFile(filename: string): FileCategory {
    const extension = getFileExtension(filename);

    for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
        if (config.extensions.includes(extension)) {
            return category as FileCategory;
        }
    }

    return 'other';
}

// Get category config for a file
export function getFileCategoryConfig(filename: string): FileCategoryConfig {
    const category = categorizeFile(filename);
    return FILE_CATEGORIES[category];
}

// Get icon for file based on category
export function getFileIcon(filename: string): string {
    const config = getFileCategoryConfig(filename);
    return config.icon;
}

// Get color for file based on category
export function getFileColor(filename: string): string {
    const config = getFileCategoryConfig(filename);
    return config.color;
}

// Get background color for file based on category
export function getFileBgColor(filename: string): string {
    const config = getFileCategoryConfig(filename);
    return config.bgColor;
}

// Filter files by category
export function filterFilesByCategory(files: any[], category: FileCategory | 'all'): any[] {
    if (category === 'all') return files;

    return files.filter(file => {
        const fileCategory = categorizeFile(file.name);
        return fileCategory === category;
    });
}

// Get file count by category
export function getFileCounts(files: any[]): Record<FileCategory | 'all', number> {
    const counts: Record<string, number> = {
        all: files.length,
        images: 0,
        videos: 0,
        audio: 0,
        docs: 0,
        archives: 0,
        code: 0,
        executables: 0,
        other: 0
    };

    files.forEach(file => {
        const category = categorizeFile(file.name);
        counts[category]++;
    });

    return counts as Record<FileCategory | 'all', number>;
}
