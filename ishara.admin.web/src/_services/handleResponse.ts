export async function handleResponse<T>(response: Response, callback?: Function): Promise<T> {
    const text = await response.text();
    const data = text && JSON.parse(text);
    if (!response.ok) {
        if (callback && response.status === 401) {
            // auto logout if 401 response returned from api
            callback();
        }
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }
    return data as T;
}
