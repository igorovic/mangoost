import LRU from 'lru-cache'; // import with * has better compatibility
import sizeof from 'object-sizeof';

const options = {
    max: 100 * 1024 * 1024 // since we are working with strings should represent 100MB
    ,length (n: any, key: string) { return sizeof(n) + key.length } // not sure that one char uses 8bytes according to `object-sizeof` source code; char size may vary
    ,maxAge: 1000 * 60 // 60 seconds

}

export const cache = new LRU(options);