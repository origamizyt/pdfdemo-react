import { useEffect, useState } from "react"

export interface UseLocalStorageConfig<T> {
    key: string,
    default: T
}

export type Setter<T> = (value: T) => void;

export default function useLocalStorage<T>(config: UseLocalStorageConfig<T>): [T, Setter<T>] {
    const [value, setValue] = useState(config.default);

    useEffect(() => {
        const item = localStorage.getItem(config.key);
        if (item) {
            setValue(JSON.parse(item));
        }
        else {
            setValue(config.default);
            localStorage.setItem(config.key, JSON.stringify(config.default));
        }
    }, [config.key]);

    function update(newValue: T) {
        if (value !== newValue) {
            localStorage.setItem(config.key, JSON.stringify(newValue));
        }
        setValue(newValue);
    }

    return [value, update];
}