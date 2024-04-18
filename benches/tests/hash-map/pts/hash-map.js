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
        $__putByIdDirect(this, "_capacity", void 0);
        $__putByIdDirect(this, "_elementCount", void 1);
        $__putByIdDirect(this, "_elementData", void 2);
        $__putByIdDirect(this, "_loadFactor", void 3);
        $__putByIdDirect(this, "_modCount", void 4);
        $__putByIdDirect(this, "_threshold", void 5);
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
        this._threshold = ($__getByIdOffset(this, "_elementData", 2).length * $__getByIdOffset(this, "_loadFactor", 3)) | 0;
    }
    clear() {
        if (!$__getByIdOffset(this, "_elementCount", 1))
            return;
        this._elementCount = 0;
        for (let i = $__getByIdOffset(this, "_elementData", 2).length; i--;)
            $__getByIdOffset(this, "_elementData", 2)[i] = null;
        this._modCount++;
    }
    clone() {
        const result = new HashMap($__getByIdOffset(this, "_elementData", 2).length, $__getByIdOffset(this, "_loadFactor", 3));
        result.putAll(this);
        return result;
    }
    containsKey(key) {
        return !!this._getEntry(key);
    }
    containsValue(value) {
        for (let i = $__getByIdOffset(this, "_elementData", 2).length; i--;) {
            for (let entry = $__getByIdOffset(this, "_elementData", 2)[i]; entry; entry = $__getByIdOffset(entry, "_next", 3)) {
                if (HashMap.equals(value, $__getByIdOffset(entry, "_value", 1)))
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
        return entry ? $__getByIdOffset(entry, "_value", 1) : null;
    }
    _getEntry(key) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & ($__getByIdOffset(this, "_elementData", 2).length - 1);
        return this._findKeyEntry(key, index, hash);
    }
    _findKeyEntry(key, index, keyHash) {
        let entry = $__getByIdOffset(this, "_elementData", 2)[index];
        while (entry && ($__getByIdOffset(entry, "_origKeyHash", 2) !== keyHash || !HashMap.equals(key, $__getByIdOffset(entry, "_key", 0))))
            entry = $__getByIdOffset(entry, "_next", 3);
        return entry;
    }
    isEmpty() {
        return !$__getByIdOffset(this, "_elementCount", 1);
    }
    keySet() {
        return new KeySet(this);
    }
    put(key, value) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & ($__getByIdOffset(this, "_elementData", 2).length - 1);
        let entry = this._findKeyEntry(key, index, hash);
        if (!entry) {
            this._modCount++;
            entry = this._createHashedEntry(key, index, hash);
            if (++this._elementCount > $__getByIdOffset(this, "_threshold", 5))
                this._rehash();
        }
        const result = $__getByIdOffset(entry, "_value", 1);
        entry._value = value;
        return result;
    }
    _createHashedEntry(key, index, hash) {
        const entry = new Entry(key, hash, null);
        entry._next = $__getByIdOffset(this, "_elementData", 2)[index];
        $__getByIdOffset(this, "_elementData", 2)[index] = entry;
        return entry;
    }
    putAll(map) {
        if (map.isEmpty())
            return;
        for (const iter = map.entrySet().iterator(); iter.hasNext();) {
            const entry = iter.next();
            this.put($__getByIdOffset(entry, "_key", 0), $__getByIdOffset(entry, "_value", 1));
        }
    }
    _rehash(capacity) {
        if (capacity == null)
            capacity = $__getByIdOffset(this, "_elementData", 2).length;
        const length = HashMap.calculateCapacity(!capacity ? 1 : capacity << 1);
        const newData = new Array(length);
        for (let i = 0; i < $__getByIdOffset(this, "_elementData", 2).length; ++i) {
            let entry = $__getByIdOffset(this, "_elementData", 2)[i];
            $__getByIdOffset(this, "_elementData", 2)[i] = null;
            while (entry) {
                const index = $__getByIdOffset(entry, "_origKeyHash", 2) & (length - 1);
                const next = $__getByIdOffset(entry, "_next", 3);
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
        return $__getByIdOffset(entry, "_value", 1);
    }
    _removeEntry(entry) {
        const index = $__getByIdOffset(entry, "_origKeyHash", 2) & ($__getByIdOffset(this, "_elementData", 2).length - 1);
        let current = $__getByIdOffset(this, "_elementData", 2)[index];
        if (current === entry)
            $__getByIdOffset(this, "_elementData", 2)[index] = $__getByIdOffset(entry, "_next", 3);
        else {
            while (current._next !== entry)
                current = current._next;
            current._next = $__getByIdOffset(entry, "_next", 3);
        }
        this._modCount++;
        this._elementCount--;
    }
    _removeEntryForKey(key) {
        const hash = HashMap.computeHashCode(key);
        const index = hash & ($__getByIdOffset(this, "_elementData", 2).length - 1);
        let entry = $__getByIdOffset(this, "_elementData", 2)[index];
        let last = null;
        while (entry !== null && !($__getByIdOffset(entry, "_origKeyHash", 2) === hash && HashMap.equals(key, $__getByIdOffset(entry, "_key", 0)))) {
            last = entry;
            entry = $__getByIdOffset(entry, "_next", 3);
        }
        if (!entry)
            return null;
        if (!last)
            $__getByIdOffset(this, "_elementData", 2)[index] = $__getByIdOffset(entry, "_next", 3);
        else
            last._next = $__getByIdOffset(entry, "_next", 3);
        this._modCount++;
        this._elementCount--;
        return entry;
    }
    size() {
        return $__getByIdOffset(this, "_elementCount", 1);
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
        this._expectedModCount = $__getByIdOffset(map, "_modCount", 4);
        this._futureEntry = null;
        this._currentEntry = null;
        this._prevEntry = null;
        this._position = 0;
    }
    hasNext() {
        if ($__getByIdOffset(this, "_futureEntry", 2))
            return true;
        while ($__getByIdOffset(this, "_position", 5) < $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2).length) {
            if (!$__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2)[$__getByIdOffset(this, "_position", 5)])
                this._position++;
            else
                return true;
        }
        return false;
    }
    _checkConcurrentMod() {
        if ($__getByIdOffset(this, "_expectedModCount", 1) !== $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_modCount", 4))
            throw new Error("Concurrent HashMap modification detected");
    }
    _makeNext() {
        this._checkConcurrentMod();
        if (!this.hasNext())
            throw new Error("No such element");
        if (!$__getByIdOffset(this, "_futureEntry", 2)) {
            this._currentEntry = $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2)[this._position++];
            this._futureEntry = $__getByIdOffset(this, "_currentEntry", 3)._next;
            this._prevEntry = null;
            return;
        }
        if ($__getByIdOffset(this, "_currentEntry", 3))
            this._prevEntry = $__getByIdOffset(this, "_currentEntry", 3);
        this._currentEntry = $__getByIdOffset(this, "_futureEntry", 2);
        this._futureEntry = $__getByIdOffset($__getByIdOffset(this, "_futureEntry", 2), "_next", 3);
    }
    remove() {
        this._checkConcurrentMod();
        if (!$__getByIdOffset(this, "_currentEntry", 3))
            throw new Error("Illegal state");
        if (!$__getByIdOffset(this, "_prevEntry", 4)) {
            const index = $__getByIdOffset($__getByIdOffset(this, "_currentEntry", 3), "_origKeyHash", 2) & ($__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2).length - 1);
            $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2)[index] = $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementData", 2)[index]._next;
        }
        else
            $__getByIdOffset(this, "_prevEntry", 4)._next = $__getByIdOffset($__getByIdOffset(this, "_currentEntry", 3), "_next", 3);
        this._currentEntry = null;
        this._expectedModCount++;
        $__getByIdOffset(this, "_associatedMap", 0)._modCount++;
        $__getByIdOffset(this, "_associatedMap", 0)._elementCount--;
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
        return $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementCount", 1);
    }
    clear() {
        $__getByIdOffset(this, "_associatedMap", 0).clear();
    }
    remove(object) {
        const entry = $__getByIdOffset(this, "_associatedMap", 0)._getEntry($__getByIdOffset(object, "_key", 0));
        if (!entry)
            return false;
        if (!HashMap.equals($__getByIdOffset(entry, "_value", 1), $__getByIdOffset(object, "_value", 1)))
            return false;
        $__getByIdOffset(this, "_associatedMap", 0)._removeEntry(entry);
        return true;
    }
    contains(object) {
        const entry = $__getByIdOffset(this, "_associatedMap", 0)._getEntry($__getByIdOffset(object, "_key", 0));
        if (!entry)
            return false;
        return HashMap.equals($__getByIdOffset(entry, "_value", 1), $__getByIdOffset(object, "_value", 1));
    }
    iterator() {
        return new EntryIterator($__getByIdOffset(this, "_associatedMap", 0));
    }
}
class KeySet {
    constructor(map) {
        this._associatedMap = map;
    }
    contains(object) {
        return $__getByIdOffset(this, "_associatedMap", 0).containsKey(object);
    }
    size() {
        return $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementCount", 1);
    }
    clear() {
        $__getByIdOffset(this, "_associatedMap", 0).clear();
    }
    remove(key) {
        return !!$__getByIdOffset(this, "_associatedMap", 0).remove(key);
    }
    iterator() {
        return new KeyIterator($__getByIdOffset(this, "_associatedMap", 0));
    }
}
class ValueCollection {
    constructor(map) {
        this._associatedMap = map;
    }
    contains(object) {
        return $__getByIdOffset(this, "_associatedMap", 0).containsValue(object);
    }
    size() {
        return $__getByIdOffset($__getByIdOffset(this, "_associatedMap", 0), "_elementCount", 1);
    }
    clear() {
        $__getByIdOffset(this, "_associatedMap", 0).clear();
    }
    iterator() {
        return new ValueIterator($__getByIdOffset(this, "_associatedMap", 0));
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
        keySum += $__getByIdOffset(entry, "_key", 0);
        valueSum += $__getByIdOffset(entry, "_value", 1);
    }
    if (result !== 42 * COUNT * 5)
        throw "Error: result = " + result;
    if (keySum !== (COUNT * (COUNT + 1) / 2 - COUNT))
        throw "Error: keySum = " + keySum;
    if (valueSum !== 42 * COUNT)
        throw "Error: valueSum = " + valueSum;
}
run();
