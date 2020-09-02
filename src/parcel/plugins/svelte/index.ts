export default function main(bundler: any) {
    bundler.addAssetType('svelte', require.resolve('./svelte.js'));
};