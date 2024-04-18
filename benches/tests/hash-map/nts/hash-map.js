"use strict";
class HashMap {
    static calculateCapacity(x) {
        if (x >= 1 << 30)
            return 1 << 30;
        if (x === 0)
            return 16;
        x = x - 1;
        x |= x >> 1;
        x |= x >> 2;
        x |= x >> 4;
        x |= x >> 8;
        x |= x >> 16;
        return x + 1;
    }
    static computeHashCode(key) {
        switch (typeof key) {
            case "undefined":
                return 0;
            case "object":
                if (!key)
                    return 0;
            case "function":
                return key.hashCode();
            case "boolean":
                return key | 0;
            case "number":
                if ((key | 0) === key)
                    return key;
                key = "" + key;
            case "string":
                let h = 0;
                const len = key.length;
                for (let index = 0; index < len; index++) {
                    h = (((31 * h) | 0) + key.charCodeAt(index)) | 0;
                }
                return h;
            default:
                throw new Error("Internal error: Bad JavaScript value type");
        }
    }
    static equals(a, b) {
        if (typeof a !== typeof b)
            return false;
        switch (typeof a) {
            case "object":
                if (!a)
                    return !b;
            case "function":
                switch (typeof b) {
                    case "object":
                    case "function":
                        return a.equals(b);
                    default:
                        return false;
                }
            default:
                return a == b;
        }
    }
    constructor(capacity, loadFactor) {
        this._elementCount = 0;
        this._modCount = 0;
        this._threshold = 0;
        if (capacity == null)
            capacity = HashMap.DEFAULT_SIZE;
        if (loadFactor == null)
            loadFactor = 0.75;
        if (capacity < 0)
            throw new Error("Invalid argument to HashMap constructor: capacity is negative");
        if (loadFactor <= 0)
            throw new Error("Invalid argument to HashMap constructor: loadFactor is not positive");
        this._capacity = HashMap.calculateCapacity(capacity);
        this._elementData = new Array(this._capacity);
        this._loadFactor = loadFactor;
        this._computeThreshold();
    }
    _computeThreshold() {
        this._threshold = (this._elementData.length * this._loadFactor) | 0;
    }
    clear() {
        if (!this._elementCount)
            return;
        this._elementCount = 0;
        for (let i = this._elementData.length; i--;)
            this._elementData[i] = null;
        this._modCount++;
    }
    clone() {
        const result = new HashMap(this._elementData.length, this._loadFactor);
        result.putAll(this);
        return result;
    }
    containsKey(key) {
        return !!this._getEntry(key);
    }
    containsValue(value) {
        for (let i = this._elementData.length; i--;) {
            for (let entry = this._elementData[i]; entry; entry = entry._next) {
                if (HashMap.equals(value, entry._value))
                    return true;
            }
        }
        return false;
    }
    entrySet() {
        return new EntrySet(this);
    }
    get(key) {
        const entry = this._getEntry(key);
        return entry ? entry._value : null;
    }
    _getEntry(key) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & (this._elementData.length - 1);
        return this._findKeyEntry(key, index, hash);
    }
    _findKeyEntry(key, index, keyHash) {
        let entry = this._elementData[index];
        while (entry && (entry._origKeyHash !== keyHash || !HashMap.equals(key, entry._key)))
            entry = entry._next;
        return entry;
    }
    isEmpty() {
        return !this._elementCount;
    }
    keySet() {
        return new KeySet(this);
    }
    put(key, value) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & (this._elementData.length - 1);
        let entry = this._findKeyEntry(key, index, hash);
        if (!entry) {
            this._modCount++;
            entry = this._createHashedEntry(key, index, hash);
            if (++this._elementCount > this._threshold)
                this._rehash();
        }
        const result = entry._value;
        entry._value = value;
        return result;
    }
    _createHashedEntry(key, index, hash) {
        const entry = new Entry(key, hash, null);
        entry._next = this._elementData[index];
        this._elementData[index] = entry;
        return entry;
    }
    putAll(map) {
        if (map.isEmpty())
            return;
        for (const iter = map.entrySet().iterator(); iter.hasNext();) {
            const entry = iter.next();
            this.put(entry._key, entry._value);
        }
    }
    _rehash(capacity) {
        if (capacity == null)
            capacity = this._elementData.length;
        const length = HashMap.calculateCapacity(!capacity ? 1 : capacity << 1);
        const newData = new Array(length);
        for (let i = 0; i < this._elementData.length; ++i) {
            let entry = this._elementData[i];
            this._elementData[i] = null;
            while (entry) {
                const index = entry._origKeyHash & (length - 1);
                const next = entry._next;
                entry._next = newData[index];
                newData[index] = entry;
                entry = next;
            }
        }
        this._elementData = newData;
        this._computeThreshold();
    }
    remove(key) {
        const entry = this._removeEntryForKey(key);
        if (!entry)
            return null;
        return entry._value;
    }
    _removeEntry(entry) {
        const index = entry._origKeyHash & (this._elementData.length - 1);
        let current = this._elementData[index];
        if (current === entry)
            this._elementData[index] = entry._next;
        else {
            while (current._next !== entry)
                current = current._next;
            current._next = entry._next;
        }
        this._modCount++;
        this._elementCount--;
    }
    _removeEntryForKey(key) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & (this._elementData.length - 1);
        let entry = this._elementData[index];
        let last = null;
        while (entry !== null && !(entry._origKeyHash === hash && HashMap.equals(key, entry._key))) {
            last = entry;
            entry = entry._next;
        }
        if (!entry)
            return null;
        if (!last)
            this._elementData[index] = entry._next;
        else
            last._next = entry._next;
        this._modCount++;
        this._elementCount--;
        return entry;
    }
    size() {
        return this._elementCount;
    }
    values() {
        return new ValueCollection(this);
    }
}
HashMap.DEFAULT_SIZE = 16;
class Entry {
    constructor(key, hash, value) {
        this._key = key;
        this._value = value;
        this._origKeyHash = hash;
        this._next = null;
    }
}
class AbstractMapIterator {
    constructor(map) {
        this._associatedMap = map;
        this._expectedModCount = map._modCount;
        this._futureEntry = null;
        this._currentEntry = null;
        this._prevEntry = null;
        this._position = 0;
    }
    hasNext() {
        if (this._futureEntry)
            return true;
        while (this._position < this._associatedMap._elementData.length) {
            if (!this._associatedMap._elementData[this._position])
                this._position++;
            else
                return true;
        }
        return false;
    }
    _checkConcurrentMod() {
        if (this._expectedModCount !== this._associatedMap._modCount)
            throw new Error("Concurrent HashMap modification detected");
    }
    _makeNext() {
        this._checkConcurrentMod();
        if (!this.hasNext())
            throw new Error("No such element");
        if (!this._futureEntry) {
            this._currentEntry = this._associatedMap._elementData[this._position++];
            this._futureEntry = this._currentEntry._next;
            this._prevEntry = null;
            return;
        }
        if (this._currentEntry)
            this._prevEntry = this._currentEntry;
        this._currentEntry = this._futureEntry;
        this._futureEntry = this._futureEntry._next;
    }
    remove() {
        this._checkConcurrentMod();
        if (!this._currentEntry)
            throw new Error("Illegal state");
        if (!this._prevEntry) {
            const index = this._currentEntry._origKeyHash & (this._associatedMap._elementData.length - 1);
            this._associatedMap._elementData[index] = this._associatedMap._elementData[index]._next;
        }
        else
            this._prevEntry._next = this._currentEntry._next;
        this._currentEntry = null;
        this._expectedModCount++;
        this._associatedMap._modCount++;
        this._associatedMap._elementCount--;
    }
}
class EntryIterator extends AbstractMapIterator {
    next() {
        this._makeNext();
        return this._currentEntry;
    }
}
class KeyIterator extends AbstractMapIterator {
    next() {
        this._makeNext();
        return this._currentEntry._key;
    }
}
class ValueIterator extends AbstractMapIterator {
    next() {
        this._makeNext();
        return this._currentEntry._value;
    }
}
class EntrySet {
    constructor(map) {
        this._associatedMap = map;
    }
    size() {
        return this._associatedMap._elementCount;
    }
    clear() {
        this._associatedMap.clear();
    }
    remove(object) {
        const entry = this._associatedMap._getEntry(object._key);
        if (!entry)
            return false;
        if (!HashMap.equals(entry._value, object._value))
            return false;
        this._associatedMap._removeEntry(entry);
        return true;
    }
    contains(object) {
        const entry = this._associatedMap._getEntry(object._key);
        if (!entry)
            return false;
        return HashMap.equals(entry._value, object._value);
    }
    iterator() {
        return new EntryIterator(this._associatedMap);
    }
}
class KeySet {
    constructor(map) {
        this._associatedMap = map;
    }
    contains(object) {
        return this._associatedMap.containsKey(object);
    }
    size() {
        return this._associatedMap._elementCount;
    }
    clear() {
        this._associatedMap.clear();
    }
    remove(key) {
        return !!this._associatedMap.remove(key);
    }
    iterator() {
        return new KeyIterator(this._associatedMap);
    }
}
class ValueCollection {
    constructor(map) {
        this._associatedMap = map;
    }
    contains(object) {
        return this._associatedMap.containsValue(object);
    }
    size() {
        return this._associatedMap._elementCount;
    }
    clear() {
        this._associatedMap.clear();
    }
    iterator() {
        return new ValueIterator(this._associatedMap);
    }
}
function run() {
    const map = new HashMap();
    const COUNT = 90000;
    for (let i = 0; i < COUNT; ++i)
        map.put(i, 42);
    let result = 0;
    for (let j = 0; j < 5; ++j) {
        for (let i = 0; i < COUNT; ++i)
            result += map.get(i);
    }
    let keySum = 0;
    let valueSum = 0;
    for (const iterator = map.entrySet().iterator(); iterator.hasNext();) {
        const entry = iterator.next();
        keySum += entry._key;
        valueSum += entry._value;
    }
    if (result !== 42 * COUNT * 5)
        throw "Error: result = " + result;
    if (keySum !== (COUNT * (COUNT + 1) / 2 - COUNT))
        throw "Error: keySum = " + keySum;
    if (valueSum !== 42 * COUNT)
        throw "Error: valueSum = " + valueSum;
}
run();
