
import axios from 'axios';
import Cookies from 'js-cookie';
// import toastr from 'toastr'

interface postOption {
    body?: any;
    header?: any;
}

interface token {
    access_token?: string;
    refresh_token?: string;
}

export class Api {

    host = '';
    access_token = '';
    refresh_token = '';
    currentcheck = false;

    constructor() {
        this.isConnected();
    }

    isConnected(): boolean {
        let tokenCookie = Cookies.get('token');
        if (tokenCookie) {
            let tokenObject = JSON.parse(tokenCookie);
            this.setToken(tokenObject);
        } else {
            this.connected = false
        }
        return this.connected;
    }

    setHost(host: string) {
        this.host = host;
    }

    ObjecToQuery(obj: any) {
        var str = '';
        for (let key in obj) {
            let param = encodeURIComponent(obj[key]);
            str += key + '=' + param + '&';
        }
        return str;
    }

    connected = false;
    setToken(token: token) {
        this.connected = true;
        this.access_token = token.access_token;
        this.refresh_token = token.refresh_token;
        // Can't set it in common because some request like cloudinary doesn't allow Authorization headers
        // axios.defaults.headers.common['Authorization'] = token.access_token;
    }

    saveToken(token: token) {
        var cookie = { access_token: token.access_token, refresh_token: token.refresh_token };
        Cookies.set('token', JSON.stringify(cookie), { expires: 7 });
    }

    get(path: string, arg: Object, callback: Function) {
        let query = arg ? this.ObjecToQuery(arg) : '';
        let url = this.host + path + '?' + query;
        this.send('GET', url, '', {}, callback);
    }

    post(path: string, arg: Object, options: postOption, callback: Function) {
        let bodystring = options.body ? options.body : '';
        let header = options.header ? options.header : {};
        let query = arg ? this.ObjecToQuery(arg) : '';
        let url = this.host + path + '?' + query;
        this.send('POST', url, bodystring, header, callback);
    }

    send(method: string, url: string, body: any, headers: any, callback: Function) {
        headers.Authorization = this.access_token;
        if (method == 'POST') {
            axios.post(url, body, { headers: headers })
                .then((response) => { callback(response.data) })
                .catch((error) => {
                    this.checkError(error, method, url, body, headers, callback)
                });
        } else if (method == 'GET') {
            axios.get(url, { headers: headers })
                .then((response) => { callback(response.data) })
                .catch((error) => {
                    this.checkError(error, method, url, body, headers, callback)
                }
                );
        } else {
            return console.error('Method must be GET or POST');
        }
    }

    // If catch error after request, there is no response in error.
    checkError(error: any, method: string, url: string, body: any, headers: any, callback: Function) {
        if (error) {
            if (error.response) {
                this.checkToken(url, error.response.data, (result) => {
                    if (result) {
                        this.send(method, url, body, headers, callback);
                    } else {
                        callback(error.response.data);
                    }
                });
            } else {
                callback({ success: false });
            }
        } else {
            callback({ success: false });
        }
    }

    checkToken(url: string, error: any, callback: Function) {
        if ((error.message == 'Bad Token.' || error.message == 'No token provided.') && url.indexOf('refreshtoken') == -1) {
            this.refreshToken(callback);
        } else {
            callback(false);
        }
    }

    refreshToken(callback: Function) {
        this.post('user/refreshtoken', { refresh_token: this.refresh_token }, {}, (data) => {
            if (data.success) {
                this.setToken(data);
                this.saveToken(data);
                callback(true);
            } else {
                // Make sure to disconnect before the callback
                this.disconnect();
                callback(false);
            }
        });
    }

    onDisconnected: Function;
    disconnect() {
        this.connected = false;
        Cookies.remove('token');
        if (this.onDisconnected) this.onDisconnected();
    }

    getToken() {
        return this.access_token;
    }

    getSubdomain() {
        let hostname = window.location.hostname;
        var regexParse = new RegExp('[a-z\-0-9]{2,63}\.[a-z\.]{2,5}$');
        var urlParts = regexParse.exec(hostname);
        return hostname.replace(urlParts[0], '').slice(0, -1);
    }

    getAllUrlParams() {
        var queryString = window.location.search.slice(1);
        var obj:any = {};

        if (queryString) {
            queryString = queryString.split('#')[0];
            var arr = queryString.split('&');

            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');
                var paramName = a[0];
                var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

                paramName = paramName.toLowerCase();
                if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

                if (paramName.match(/\[(\d+)?\]$/)) {
                    var key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];

                    if (paramName.match(/\[\d+\]$/)) {
                        var index = /\[(\d+)\]/.exec(paramName)[1];
                        obj[key][index] = paramValue;
                    } else {
                        obj[key].push(paramValue);
                    }
                } else {
                    if (!obj[paramName]) {
                        obj[paramName] = paramValue;
                    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                        obj[paramName] = [obj[paramName]];
                        obj[paramName].push(paramValue);
                    } else {
                        obj[paramName].push(paramValue);
                    }
                }
            }
        }

        return obj;
    }

}