declare module 'archiver' {
  export type ArchiverFormat = 'zip' | string;

  export interface Archiver {
    on(event: 'warning' | 'error', listener: (err: Error) => void): this;
    append(source: Buffer | string, data: { name: string }): this;
    finalize(): Promise<void>;
  }

  export interface ArchiverOptions {
    zlib?: { level?: number };
    [key: string]: unknown;
  }

  export default function archiver(format: ArchiverFormat, options?: ArchiverOptions): Archiver;
}

