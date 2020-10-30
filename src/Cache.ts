const isLocalStorageAvailable: boolean = (() => {
    try {
        const key = 'fUjXn2r59'; // A random key
        const value = 'test';
        localStorage.setItem(key, value);
        const gotValue = localStorage.getItem(key);
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
})();

export function saveToLocalStorage(key: string, value: string, expired: number): number {
    if (!isLocalStorageAvailable) {
        return -1;
    }
    const savedItem = {
        value: value,
        expired: Date.now() + 1000 * expired,
    };
    try {
        localStorage.setItem(`casbinjs_${key}`, JSON.stringify(savedItem));
    } catch (e) {
        throw e;
        // TODO: Process the quotaExceededError
    }
    return 0;
}

export function loadFromLocalStorage(key: string): string {
    if (!isLocalStorageAvailable) {
        return '';
    }
    const itemStr = localStorage.getItem(`casbinjs_${key}`);
    // No cache
    if (itemStr === null) {
        return '';
    }
    const item = JSON.parse(itemStr);

    if (Date.now() > item['expired']) {
        localStorage.removeItem(`casbinjs_${key}`);
        return '';
    } else {
        return item['value'];
    }
}

export function removeLocalStorage(key: string) {
    localStorage.removeItem(`casbinjs_${key}`);
}
