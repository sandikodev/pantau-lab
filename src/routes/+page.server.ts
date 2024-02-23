import type { Actions } from '@sveltejs/kit';
import { RouterOSAPI } from 'node-routeros';
import { SECRET_ROS_ADDR, SECRET_ROS_USER, SECRET_ROS_PASS } from '$env/static/private'

function customSort(a: any, b: any) {
    const nameA = a['host-name'].match(/([A-Z]+)-(\w+)/);
    const nameB = b['host-name'].match(/([A-Z]+)-(\w+)/);

    const suffixA = nameA[2];
    const suffixB = nameB[2];

    return suffixA.localeCompare(suffixB);
}

function customSortNew(a: any, b: any) {
    const regex = /lab1-(\w)(\d+)/; // Regular expression to match lab1- followed by a letter and then digits
    const [, charA, numA] = a['host-name'].match(regex);
    const [, charB, numB] = b['host-name'].match(regex);

    if (charA !== charB) {
        return charA.localeCompare(charB); // Sort alphabetically
    } else {
        return parseInt(numA) - parseInt(numB); // Sort numerically
    }
}


type komputer = {
    'host-name': string;
    'active-mac-address': string;
    'active-address': string;
    'dynamic': string;
    'status': string;
}

export async function load() {
    const conn = new RouterOSAPI({
        host: SECRET_ROS_ADDR,
        user: SECRET_ROS_USER,
        password: SECRET_ROS_PASS
    });

    try {
        await conn.connect();
        const hostQuery = await conn.write('/ip/dhcp-server/lease/print');
        // console.log(hostQuery)
        // use this snippet for filtering specific prefix
        // filter(obj => obj['host-name'].startsWith('PC-A'))
        const hostData: komputer[] = hostQuery.map(obj => ({
            'host-name': obj['host-name'] as string,
            'active-mac-address': obj['active-mac-address'] as string,
            'active-address': obj['active-address'] as string,
            'address': obj['address'] as string,
            'dynamic': obj['dynamic'] as string,
            'status': obj['status'] as string
        }));

        const userActive = await conn.write('/ip/hotspot/active/print');
        const userHost = await conn.write('/ip/hotspot/host/print');
        const userBinding = await conn.write('/ip/hotspot/ip-binding/print');
        // console.log(userHost.some(obj => obj['mac-address'] == '08:00:27:4A:24:E4'));

        // console.log(userBinding[0]['disabled'])
        console.log(hostData.filter(obj => obj['host-name'].match(/^lab1-.*/)).sort(customSortNew))
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
            host: SECRET_ROS_ADDR,
            user: SECRET_ROS_USER,
            password: SECRET_ROS_PASS
        });

        let message, bindings, target
        await conn.connect();
        const data = await event.request.formData();
        let command = event.url.searchParams.get('/binding') == "1" ? 'bind' : 'unbind';

        switch (command) {
            case "bind":
                console.log("binding => search target")
                target = await conn.write('/ip/hotspot/ip-binding/print')
                target = target.filter(obj => obj['mac-address'] == data.get('target'))

                if (target.length == 0) {
                    // if no target available => start to make binding
                    console.log("binding => start")

                    const dhcpServer = await conn.write('/ip/dhcp-server/lease/print')
                    const ipLease = dhcpServer.filter(obj => obj['active-mac-address'] == data.get('target'))[0]['address']

                    await conn.write('/ip/hotspot/ip-binding/add', [
                        `=mac-address=${data.get('target')}`,
                        `=address=${ipLease}`,
                        `=to-address=${ipLease}`,
                    ])

                    message = "binding done"
                    console.log("binding => success")
                } else if (target[0]['disabled'] == 'true') {
                    console.log("re-binding => start")

                    target = target.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']
                    await conn.write('/ip/hotspot/ip-binding/enable', [
                        `=.id=${target}`,
                    ])

                    console.log("re-binding => success")
                } else {
                    console.log("binding => skipped")
                }
                break;
            case "unbind":
                console.log("unbinding => search target")
                bindings = await conn.write('/ip/hotspot/ip-binding/print')
                target = bindings.length && bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']
                const isEnabled = bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['disabled'] == 'false'

                if (target != 0 && isEnabled) {
                    console.log("unbinding => start")
                    await conn.write('/ip/hotspot/ip-binding/disable', [
                        `=.id=${target}`,
                    ])
                    console.log("unbinding => success")
                }
                break;
            default:
                console.log("error")
                break;
        }

        conn.close();
        return { success: true, data: message };
    },
    bindOption: async (event) => {
        const conn = new RouterOSAPI({
            host: SECRET_ROS_ADDR,
            user: SECRET_ROS_USER,
            password: SECRET_ROS_PASS
        });

        await conn.connect();
        const data = await event.request.formData();

        const bindings = await conn.write('/ip/hotspot/ip-binding/print');
        const id = bindings.filter(obj => obj['mac-address'] == data.get('target'))[0]['.id']

        switch (event.url.searchParams.get('/bindOption')) {
            case "block":
                await conn.write('/ip/hotspot/ip-binding/set', [
                    `=.id=${id}`,
                    '=type=blocked'
                ]);
                console.log("bindOption => blocked success", id)
                break;
            case "bypass":
                await conn.write('/ip/hotspot/ip-binding/set', [
                    `=.id=${id}`,
                    '=type=bypass'
                ]);
                console.log("bindOption => bypass success", id)
                break;
            case "normal":
                await conn.write('/ip/hotspot/ip-binding/set', [
                    `=.id=${id}`,
                    '=type=regular'
                ]);
                console.log("bindOption => normal success", id)
                break;
            default:
                break;
        }

        conn.close();
        return { success: true };
    },
    leaseChange: async (event) => {
        const conn = new RouterOSAPI({
            host: SECRET_ROS_ADDR,
            user: SECRET_ROS_USER,
            password: SECRET_ROS_PASS
        });

        await conn.connect();
        const data = await event.request.formData();

        console.log("lease => search target")
        const dhcpServer = await conn.write('/ip/dhcp-server/lease/print')
        const target = dhcpServer.filter(obj => obj['active-mac-address'] == data.get('macaddr'))

        if (target.length != 0 && (target[0]['address'] != data.get('address'))) {
            console.log("lease => search start")
            const id = target[0]['.id']
            await conn.write('/ip/dhcp-server/lease/set', [
                `=.id=${id}`,
                `=address=${data.get('address')}`
            ]).then(() =>
                console.log("lease => updated")
            );
        }
        console.log("lease => done")
        conn.close();
        return { success: true };
    }
};
