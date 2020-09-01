# Generate only the static content and no svelte app for the page

```html
<script context="module">
    export const StaticOnly = true;
</script>
```

# Give initial props for SSR and SSG

```html
<script context="module">
    export const initialData = {
        props: {
            name: "Igor",
            message: "Bonjour"
        },
        async: {
            url: "https://swapi.dev/api/people/1/"
        }
    };
</script>
```

Mangoost will extract `initialData` during the build. 
- `props`: are passed to the page Component on rendering
- `async`: This trigger api calls. The retruned data will be merged into `props` and passed to the component on rendering.