export default function to<T>(promise: T): Promise<[any | null, T | null]> {
    return promise
    .then(data => [null, data])
    .catch(err => [err, null]);
}