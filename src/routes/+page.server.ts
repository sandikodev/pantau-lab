import type { Actions } from '@sveltejs/kit';
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
        // console.log(hostQuery)
        // use this snippet for filtering specific prefix
        // filter(obj => obj['host-name'].startsWith('PC-A'))
        const hostData = hostQuery.map(obj => ({
            'host-name': obj['host-name'] as string,
            'active-mac-address': obj['active-mac-address'] as string,
            'active-address': obj['active-address'] as string,
            'dynamic': obj['dynamic'] as string,
            'status': obj['status'] as string
        })).sort(customSort);

        const userActive = await conn.write('/ip/hotspot/active/print');
        const userHost = await conn.write('/ip/hotspot/host/print');
        const userBinding = await conn.write('/ip/hotspot/ip-binding/print');
        // console.log(userHost.some(obj => obj['mac-address'] == '08:00:27:4A:24:E4'));

        conn.close();
        return {
            komputer: hostData,
            user: {
                active: userActive,
                host: userHost,
                binding: userBinding
            }
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        return {
            status: 500, // or any other appropriate error status
            error: 'Failed to load data'
        };
    }
}

export const actions: Actions = {
    binding: async (event) => {
        const conn = new RouterOSAPI({
            host: '172.16.1.23',
            user: 'admin',
            password: '',
        });

        await conn.connect();
        const data = await event.request.formData();

        const bindings = await conn.write('/ip/hotspot/ip-binding/print')
        let result, id = bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']

        if (id) {
            result = await conn.write('/ip/hotspot/ip-binding/disable', [
                `=.id=${id}`,
            ])
        }
        
        if (!id) {
            const hosts = await conn.write('/ip/hotspot/host/print')
            id = hosts.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']

            result = await conn.write('/ip/hotspot/host/make-binding', [
                `=.id=${id}`
            ])
        }


        conn.close();
        return { success: true, data: result };
    },
    unBinding: async (event) => {
        const conn = new RouterOSAPI({
            host: '172.16.1.23',
            user: 'admin',
            password: '',
        });
        await conn.connect();
        const data = await event.request.formData();

        const bindings = await conn.write('/ip/hotspot/ip-binding/print')
        let id = bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']

        let result = await conn.write('/ip/hotspot/ip-binding/disable', [
            `=.id=${id}`,
        ])

        conn.close();
        return { success: true, data: result };
    },

    bindBypass: async (event) => {
        const conn = new RouterOSAPI({
            host: '172.16.1.23',
            user: 'admin',
            password: '',
        });

        await conn.connect();
        const data = await event.request.formData();
        // Object.fromEntries(data)
        // ip hotspot ip-binding set [find where address=10.10.10.99] type=regular 

        const bindings = await conn.write('/ip/hotspot/ip-binding/print');
        const id = bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']

        const Set = await conn.write('/ip/hotspot/ip-binding/set', [
            `?.id=0`,
            '=type=regular'
        ]);

        // console.log(id);

        conn.close();
        return { success: true };
    },
};
