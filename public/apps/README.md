How to use the `public/apps` launcher

- Drop a built/static web app into a subfolder here: `public/apps/my-game/` (it should contain an `index.html`).
- You can also create a symbolic link to a project's build output folder if you prefer not to copy files.
- Start the JoshHub dev server (`npm run dev` / `pnpm dev`) and open `http://localhost:3000/apps`.
- Click an app entry to open its `index.html` in a new browser tab.

Notes and tips
- This launcher serves static files placed under `public/apps` via Next's static serving. For apps that require a dev server (React, Vite, Next, etc.), run that project's dev server separately and add a small static redirect page into `public/apps/<name>/` that forwards to `http://localhost:PORT`.
- Example redirect `index.html` content to forward to a dev server:

```html
<!doctype html>
<meta http-equiv="refresh" content="0;url=http://localhost:5173/">
<script>location.href = 'http://localhost:5173/'</script>
```

This allows opening projects in a new tab even when the project itself runs on its own dev server.
