# Styles

You can organize your styles as you wish in any project folder. You can also import styles in other styles.


# Build output

- One main style file per page if any `<style>` is defined in the page.
- If tailwind is used, a global tailwind file is generated and purged. It will automatically be imported on any page that requires `tailwind`. 
- You can configure a root style folder. But all style files will respect the page's directory structure to avoid conflicts. 

