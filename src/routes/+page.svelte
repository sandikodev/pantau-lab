<script lang="ts">
	import Fa from 'svelte-fa';
	import { faNetworkWired } from '@fortawesome/free-solid-svg-icons';

	import type { PageData } from './$types';

	export let data: PageData;
	export let error: unknown;

	let { komputer, user } = data;

	let bindDisabled = (target: string) => {
		return user?.binding.filter((data) => data['mac-address'] == target)[0]?.disabled == 'true';
	};

	let bindAvailable = (target: string) => {
		return user?.binding.filter((data) => data['mac-address'] == target)[0];
	};

	function bindingBypass() {
		alert('ok');
	}
</script>

{#if error}
	<p>Error: {error}</p>
{:else if data}
	<div class="grid grid-cols-3 gap-4">
		{#each komputer as item}
			<div style={item['status'] == 'waiting' ? 'border-color: red' : 'border-color: green'}>
				<article
					class="flex flex-col h-full overflow-hidden rounded-lg shadow-lg {item['dynamic'] ==
					'true'
						? 'bg-gray-200'
						: 'bg-inherit'}"
				>
					<header class="flex items-center justify-between leading-none p-2 md:p-4">
						<a
							class="flex items-center no-underline hover:underline text-black"
							href="https://google.com"
						>
							<img
								alt="Placeholder"
								class="block rounded-full"
								src="https://picsum.photos/32/32/?random"
							/>
							<p class="ml-2 text-sm">{item['host-name']}</p>
						</a>
						<div
							class="flex space-x-2 items-center justify-center {item['status'] == 'waiting'
								? 'text-red-500'
								: 'text-green-500'} "
						>
							<p>
								{#if item['status'] == 'waiting'}
									putus
								{:else}
									terhubung
								{/if}
							</p>
							<Fa icon={faNetworkWired} />
						</div>
					</header>
					<div class="h-full flex flex-col">
						<form method="POST" class="px-2">
							<input type="hidden" name="target" id="target" value={item['active-mac-address']} />
							{#if (item['status'] == 'bound' && !bindAvailable(item['active-mac-address'])) || bindDisabled(item['active-mac-address'])}
								<button
									formaction="?/binding=1"
									class="w-full text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
									>Binding</button
								>
							{/if}
							{#if !bindDisabled(item['active-mac-address']) && bindAvailable(item['active-mac-address'])}
								<button
									formaction="?/binding=0"
									class="w-full text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:focus:ring-red-900"
									>Unbinding</button
								>
							{/if}
						</form>
						{#if !bindDisabled(item['active-mac-address']) && bindAvailable(item['active-mac-address'])}
							<form method="POST" class="flex px-2">
								<input type="hidden" name="target" id="target" value={item['active-mac-address']} />
								<button
									formaction="?/bindOption=block"
									class="w-full text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
									>block</button
								>
								<button
									formaction="?/bindOption=bypass"
									class="w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
									>bypass</button
								>
								<button
									formaction="?/bindOption=normal"
									class="w-full text-gray-900 bg-purple border border-purple-300 focus:outline-none hover:bg-purple-100 focus:ring-4 focus:ring-purple-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-purple dark:border-purple-600 dark:hover:bg-purple-700 dark:hover:border-purple-600 dark:focus:ring-purple-700"
									>normal</button
								>
							</form>
						{/if}
						<div class="h-full space-y-2 py-2 flex flex-col justify-end">
							{#if item['status'] == 'bound'}
								<form method="POST" action="?/leaseChange" class="px-4">
									<label
										for="macaddr"
										class="block text-sm font-medium text-gray-900 dark:text-white">mac</label
									>
									<input
										type="text"
										id="macaddr"
										name="macaddr"
										class="pointer-events-none mb-2 bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										value={item['active-mac-address']}
									/>
									<label
										for="activeaddr"
										class="block text-sm font-medium text-gray-900 dark:text-white">active</label
									>
									<input
										type="text"
										id="activeaddr"
										name="activeaddr"
										class="pointer-events-none mb-2 bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										value={item['active-address']}
									/>
									<label
										for="address"
										class="block text-sm font-medium text-gray-900 dark:text-white">address</label
									>
									<input
										type="text"
										id="address"
										name="address"
										class="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
										value={item['address']}
										disabled={item['dynamic'] == 'true'}
									/>
									<button type="submit" class="hidden" aria-hidden="true"></button>
								</form>
							{:else}
								<div class="h-full px-4 flex flex-col items-center justify-center">
									<h1 class="font-semibold">Komputer tidak terhubung</h1>
									<p class="mt-4 text-center">
										Silahkan cek kabel Lan atau Komputer dalam keadaan mati
									</p>
								</div>
							{/if}
						</div>
					</div>
					<div class="flex flex-col">
						<img
							alt="Placeholder"
							class="block h-auto w-full"
							src="https://picsum.photos/600/400/?random"
						/>
						{#if user?.active.filter((obj) => obj['address'] == item['active-address']).length}
							<footer class="flex items-center justify-between leading-tight p-2 md:p-4">
								<p class="text-md">
									pengguna: {user?.active.filter(
										(obj) => obj['address'] == item['active-address']
									)[0]['user']}
								</p>
								<p class="text-grey-darker text-sm">
									uptime: {user?.active.filter(
										(obj) => obj['address'] == item['active-address']
									)[0]['uptime']}
								</p>
							</footer>
						{/if}
					</div>
				</article>
			</div>
		{/each}
	</div>
{:else}
	<p>Loading...</p>
{/if}
