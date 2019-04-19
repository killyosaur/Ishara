// @ts-check
/** 
 * @param {Response} response
 * @param {Function} callback
 */
export async function handleResponse(response, callback) {
    const text = await response.text();
    const data = text && JSON.parse(text);
    if (!response.ok) {
        if (response.status === 401) {
            // auto logout if 401 response returned from api
            callback && callback();
            window.location.reload(true);
        }
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }
    return data;
}
