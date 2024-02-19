import { RouterOSAPI } from 'node-routeros';

export async function load() {
    const conn = new RouterOSAPI({
        host: '172.16.10.1',
        user: 'admin',
        password: '',
    });

    try {
        await conn.connect();
        const data = await conn.write('/ip/dhcp-server/lease/print');

        console.log(data)
        const filteredData = data.map(obj => ({
            'host-name': obj['host-name'] as string,
            'active-mac-address': obj['active-mac-address'] as string,
            'active-address': obj['active-address'] as string,
            'dynamic': obj['dynamic'] as string,
            'status': obj['status'] as string
        }));

        console.log(filteredData);
        conn.close();
        return {
            response: filteredData
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        return {
            status: 500, // or any other appropriate error status
            error: 'Failed to load data'
        };
    }
}