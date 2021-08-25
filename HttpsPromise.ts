import https from 'https'
import { stringify } from 'querystring'

type ArrayItems<T> = T extends Array<infer I> ? I : never

export type Methods = ArrayItems<[
    'ACL', 'BIND', 'CHECKOUT',
    'CONNECT', 'COPY', 'DELETE',
    'GET', 'HEAD', 'LINK',
    'LOCK', 'M-SEARCH', 'MERGE',
    'MKACTIVITY', 'MKCALENDAR', 'MKCOL',
    'MOVE', 'NOTIFY', 'OPTIONS',
    'PATCH', 'POST', 'PRI',
    'PROPFIND', 'PROPPATCH', 'PURGE',
    'PUT', 'REBIND', 'REPORT',
    'SEARCH', 'SOURCE', 'SUBSCRIBE',
    'TRACE', 'UNBIND', 'UNLINK',
    'UNLOCK', 'UNSUBSCRIBE'
]>

function RemoveUndefined(Obj: any) {
    Object.keys(Obj).forEach(key => Obj[key] === undefined && delete Obj[key])
    return Obj
}

function QueryHandler(Query: any) {
    if (!Query)
        return ''

    let QueryStri = ""
    Query = RemoveUndefined(Query)

    for (const k in Query) {
        if (QueryStri == "") {
            QueryStri += "?"
        } else {
            QueryStri += "&"
        }
        QueryStri += k + "=" + Query[k]
    }

    return QueryStri
}

export function HttpsRequest(url: string, method: Methods, options: any, body?: any, query?: any): Promise<any> {
    const Arr = url.split('/')
    options.host = Arr[2]
    Arr.splice(0, 3)
    options.path = "/" + Arr.join('/') + QueryHandler(query)

    options.method = method

    return HttpsRawRequest(options, body)
}

export function HttpsRawRequest(options: any, body?: any) {
    return new Promise((resolve, reject) => {
        const Req = https.request(options, (res) => {

            let data: any[] = [];

            res.on('data', (fragments) => {
                data.push(fragments);
            });

            res.on('end', () => {
                let ret = Buffer.concat(data);
                resolve(JSON.parse(ret.toString()))
            });

            res.on('error', (error: string) => { //TODO: test
                reject(error)
            });
        });

        Req.write(stringify(body))
        Req.end()
    })
}