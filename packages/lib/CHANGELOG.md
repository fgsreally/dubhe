# dubhe

## 2.1.0-beta.3

### Minor Changes

- ec48efc: fix nest logic:support bundle command/public-path and so-on

### Patch Changes

- 392ffb9: support nest example,rename dubhelist.json to dubhelist.sub.json (in sub)

## 2.0.5-beta.2

### Patch Changes

- 6cd2c6b: detect command can compare dep between pub and sub.fix export command
- 3e84520: support custom resolve for unplugin-auto-import(it seems sideeffect is not required in dubhe)

## 2.0.5-beta.0

### Patch Changes

- caf16bf: patch a version to resolve unpublish pkg

## 2.0.4

### Patch Changes

- 122db68: fix cli options (not/noc)
- 9d51108: support dts hmr in dev mode (now only in vite)

## 2.0.2

### Patch Changes

- 2b5408f: remove repeated .js suffix in html importmap when using hot mode in vite

## 2.0.1

### Patch Changes

- e444958: support dubhe-project/A.js or dubhe-project/A.json(created by this.emitFile in rollup),now it more like npm assets

## 2.0.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

### Patch Changes

- a5b2537: cli can handle hash correctly and download file on demand

## 2.0.0-alpha.1

### Patch Changes

- a5b2537: cli can handle hash correctly and download file on demand

## 2.0.0-alpha.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

## 1.0.3

### Patch Changes

- add sourcemap support

## 1.0.2

### Patch Changes

- support generate/consume sourcemap in webpack/esbuild

## 1.0.1

### Patch Changes

- fd2d4a6: refactor code
- 39b5295: fix 'dubhe-import' command in cli and refactor code in dubhe repo
