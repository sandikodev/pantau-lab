import { RouterOSAPI } from 'node-routeros';

function customSort(a, b) {
    const nameA = a['host-name'].match(/([A-Z]+)-(\w+)/);
    const nameB = b['host-name'].match(/([A-Z]+)-(\w+)/);

    const suffixA = nameA[2];
    const suffixB = nameB[2];

    return suffixA.localeCompare(suffixB);
}


export async function load() {
    const conn = new RouterOSAPI({
        host: '172.16.1.23',
        user: 'admin',
        password: '',
    });

    try {
        await conn.connect();
        const hostQuery = await conn.write('/ip/dhcp-server/lease/print');
        console.log(hostQuery)
        // use this snippet for filtering specific prefix
        // filter(obj => obj['host-name'].startsWith('PC-A'))
        const hostData = hostQuery.map(obj => ({
            'host-name': obj['host-name'] as string,
            'active-mac-address': obj['active-mac-address'] as string,
            'active-address': obj['active-address'] as string,
            'dynamic': obj['dynamic'] as string,
            'status': obj['status'] as string
        })).sort(customSort);

        const userQuery = await conn.write('/ip/hotspot/active/print');
        // console.log(userQuery);

        conn.close();
        return {
            komputer: hostData,
            user: userQuery
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        return {
            status: 500, // or any other appropriate error status
            error: 'Failed to load data'
        };
    }
}