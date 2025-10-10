// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { toBase64 } from './internal/utils/base64';
import { concatBytes, encodeUTF8 } from './internal/utils/bytes';

export interface FileManifestEntry {
    path: string;
    size: number;
}

export interface PackageBlob {
    files_data: string;
    files_manifest: FileManifestEntry[];
}

/**
 * Converts an array of files to package blob format.
 * Files are concatenated together and compressed for efficient transport.
 * 
 * @param files - Array of files with path and contents
 * @returns Package blob with base64-encoded data and manifest
 */
export function convertFilesToPackageBlob(files: Array<{ path: string; contents: string }>): PackageBlob {
    if (!files || files.length === 0) {
        return {
            files_data: '',
            files_manifest: [],
        };
    }

    const manifest: FileManifestEntry[] = [];
    const buffers: Uint8Array[] = [];

    for (const file of files) {
        // Encode file contents as UTF-8 bytes
        const contentBytes = encodeUTF8(file.contents);

        // Add to manifest with path and size
        manifest.push({
            path: file.path,
            size: contentBytes.length,
        });

        // Add to buffers for concatenation
        buffers.push(contentBytes);
    }

    // Concatenate all file contents
    const concatenatedData = concatBytes(buffers);

    // TODO: Add compression here if needed (gzip, etc.)
    // For now, we'll just use the raw concatenated data

    // Base64 encode the result
    const base64Data = toBase64(concatenatedData);

    return {
        files_data: base64Data,
        files_manifest: manifest,
    };
}

/**
 * Converts package blob format back to array of files.
 * This is useful for processing responses that come in blob format.
 * 
 * @param filesData - Base64-encoded concatenated file data
 * @param manifest - Array of file manifest entries with paths and sizes
 * @returns Array of files with path and contents
 */
export function convertPackageBlobToFiles(
    filesData: string,
    manifest: FileManifestEntry[]
): Array<{ path: string; contents: string }> {
    if (!filesData || !manifest || manifest.length === 0) {
        return [];
    }

    // Decode from base64
    const concatenatedData = fromBase64(filesData);

    // TODO: Add decompression here if compression was used

    const files: Array<{ path: string; contents: string }> = [];
    let offset = 0;

    for (const entry of manifest) {
        // Extract the file data slice
        const fileData = concatenatedData.slice(offset, offset + entry.size);

        // Decode UTF-8 bytes back to string
        const contents = decodeUTF8(fileData);

        files.push({
            path: entry.path,
            contents,
        });

        offset += entry.size;
    }

    return files;
}

// Helper function to decode base64 (imported from utils)
function fromBase64(str: string): Uint8Array {
    if (typeof (globalThis as any).Buffer !== 'undefined') {
        const buf = (globalThis as any).Buffer.from(str, 'base64');
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }

    if (typeof atob !== 'undefined') {
        const bstr = atob(str);
        const buf = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) {
            buf[i] = bstr.charCodeAt(i);
        }
        return buf;
    }

    throw new Error('Cannot decode base64 string; Expected `Buffer` or `atob` to be defined');
}

// Helper function to decode UTF-8 bytes back to string
function decodeUTF8(bytes: Uint8Array): string {
    if (typeof (globalThis as any).Buffer !== 'undefined') {
        return (globalThis as any).Buffer.from(bytes).toString('utf8');
    }

    // Use TextDecoder for browser environments
    if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8').decode(bytes);
    }

    throw new Error('Cannot decode UTF-8 bytes; Expected `Buffer` or `TextDecoder` to be defined');
}