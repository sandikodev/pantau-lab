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
	<div class="flex justify-end p-2">
		<div class="p-4 max-w-sm rounded overflow-hidden shadow-lg">
			<table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
				<tr>
					<td class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
						>terhubung</td
					>
					<td>:</td>
					<td>komputer menyala</td>
				</tr>
				<tr>
					<td class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
						>putus</td
					>
					<td>:</td>
					<td>komputer mati</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="container my-12 mx-auto px-4 md:px-12">
		<div class="flex flex-wrap -mx-1 lg:-mx-4">
			{#each komputer as item}
				<div
					class="flex-1 my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3"
					style={item['status'] == 'waiting' ? 'border-color: red' : 'border-color: green'}
				>
					<article
						class="flex flex-col h-full justify-between overflow-hidden rounded-lg shadow-lg {item[
							'dynamic'
						] == 'true'
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
						<div>
							<form method="POST" class="px-2">
								<input type="hidden" name="target" id="target" value={item['active-mac-address']} />
								{#if item['status'] == 'bound' && bindDisabled(item['active-mac-address'])}
									<button
										formaction="?/binding=1"
										class="w-full text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
										>Binding</button
									>
								{:else if !bindDisabled(item['active-mac-address']) && bindAvailable(item['active-mac-address'])}
									<button
										formaction="?/binding=0"
										class="w-full text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:focus:ring-red-900"
										>Unbinding</button
									>
								{/if}
							</form>
							{#if !bindDisabled(item['active-mac-address']) && bindAvailable(item['active-mac-address'])}
								<form method="POST" class="flex px-2">
									<input
										type="hidden"
										name="target"
										id="target"
										value={item['active-mac-address']}
									/>
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
						</div>
						<div class="flex-1 flex flex-col justify-between">
							<div class="h-full space-y-2 py-2">
								{#if item['status'] == 'bound'}
									<form action="" class="px-4">
										<label for="mac" class="block text-sm font-medium text-gray-900 dark:text-white"
											>mac</label
										>
										<input
											type="text"
											id="mac"
											class="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
											value={item['active-mac-address']}
											disabled
										/>
										<label
											for="address"
											class="block text-sm font-medium text-gray-900 dark:text-white">address</label
										>
										<input
											type="text"
											id="address"
											class="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
											value={item['active-address']}
											disabled={item['dynamic'] == 'true'}
										/>
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
							<div>
								<a href="https://google.com">
									<img
										alt="Placeholder"
										class="block h-auto w-full"
										src="https://picsum.photos/600/400/?random"
									/>
								</a>
								<footer class="flex items-center justify-between leading-tight p-2 md:p-4">
									<p class="text-md">
										<!-- pengguna: {user?.filter((obj) => obj['address'] == '10.10.10.49')[0]['user'] ?? ''} -->
									</p>
									<p class="text-grey-darker text-sm">
										<!-- uptime: {user?.filter((obj) => obj['address'] == '10.10.10.49')[0]['uptime'] ?? ''} -->
									</p>
								</footer>
							</div>
						</div>
					</article>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>Loading...</p>
{/if}
