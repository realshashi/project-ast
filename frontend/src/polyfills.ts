import { Buffer } from 'buffer';
import process from 'process';

// Polyfill Buffer
(window as any).Buffer = Buffer;

// Polyfill process
(window as any).process = process;

// Polyfill global
(window as any).global = window;
