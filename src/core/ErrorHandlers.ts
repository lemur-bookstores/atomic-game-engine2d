import { EngineError } from './EngineError';
import { ErrorHandler } from './ErrorHandlerService';

export class ConsoleErrorHandler implements ErrorHandler {
    canHandle(_error: EngineError): boolean { return true; }
    async handleError(error: EngineError): Promise<void> {
        console.error('Engine Error:', error.toJSON ? error.toJSON() : error);
    }
}

export class MemoryErrorHandler implements ErrorHandler {
    private logs: EngineError[] = [];
    constructor(private max = 100) { }
    canHandle(_error: EngineError): boolean { return true; }
    async handleError(error: EngineError): Promise<void> {
        this.logs.unshift(error);
        if (this.logs.length > this.max) this.logs.length = this.max;
    }
    getLogs() { return [...this.logs]; }
}

export class LocalStorageErrorHandler implements ErrorHandler {
    constructor(private key = 'engine.logs', private max = 200) { }
    canHandle(_error: EngineError): boolean { return true; }
    async handleError(error: EngineError): Promise<void> {
        try {
            const raw = localStorage.getItem(this.key);
            const arr = raw ? JSON.parse(raw) : [];
            arr.unshift(error.toJSON ? error.toJSON() : error);
            if (arr.length > this.max) arr.splice(this.max);
            localStorage.setItem(this.key, JSON.stringify(arr));
        } catch (e) {
            console.warn('LocalStorageErrorHandler failed:', e);
        }
    }
}

// Simple UI handler that renders into a container element
export class UIErrorHandler implements ErrorHandler {
    constructor(private container: HTMLElement, private maxEntries = 50, private sanitize = true) { }
    canHandle(_error: EngineError): boolean { return true; }
    async handleError(error: EngineError): Promise<void> {
        const entry = document.createElement('div');
        entry.className = 'engine-error-entry';
        const message = this.sanitize ? escapeHtml(error.message) : error.message;
        entry.innerHTML = `\n            <div class="engine-error-time">${error.timestamp.toISOString()}</div>\n            <div class="engine-error-msg">${message}</div>\n            <pre class="engine-error-stack">${this.sanitize ? escapeHtml(error.stack || '') : error.stack || ''}</pre>\n        `;
        this.container.prepend(entry);
        while (this.container.children.length > this.maxEntries) this.container.removeChild(this.container.lastChild!);
    }
}

function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
