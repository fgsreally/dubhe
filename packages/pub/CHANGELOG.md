# dubhe-pub

## 2.1.0-beta.5

### Minor Changes

- da0fb82: update vite/rollup version

### Patch Changes

- ac9a18a: all bundler(vite/esbuild/webpack) should be external (put those in devdependence)
- Updated dependencies [bb78f41]
- Updated dependencies [75acd73]
- Updated dependencies [da0fb82]
- Updated dependencies [ac9a18a]
  - dubhe@2.1.0-beta.9

## 2.1.0-beta.4

### Patch Changes

- Updated dependencies [426efc6]
  - dubhe@2.1.0-beta.8

## 2.1.0-beta.3

### Minor Changes

- ec48efc: fix nest logic:support bundle command/public-path and so-on

### Patch Changes

- 392ffb9: support nest example,rename dubhelist.json to dubhelist.sub.json (in sub)
- Updated dependencies [ec48efc]
- Updated dependencies [392ffb9]
  - dubhe@2.1.0-beta.3

## 2.0.5-beta.1

### Patch Changes

- 048fe5c: entry name should not include 'index' when use app mode in vite

## 2.0.5-beta.0

### Patch Changes

- caf16bf: patch a version to resolve unpublish pkg
- Updated dependencies [caf16bf]
  - dubhe@2.0.5-beta.0

## 2.0.4

### Patch Changes

- f01a3a0: emitFile will crash program in watch mode
- 9d51108: support dts hmr in dev mode (now only in vite)
- Updated dependencies [122db68]
- Updated dependencies [9d51108]
  - dubhe@2.0.4

## 2.0.3

### Patch Changes

- 7710964: fix types option in vite

## 2.0.2

### Patch Changes

- 2b5408f: remove repeated .js suffix in html importmap when using hot mode in vite
- Updated dependencies [2b5408f]
  - dubhe@2.0.2

## 2.0.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

### Patch Changes

- Updated dependencies [a5b2537]
- Updated dependencies [756ffad]
  - dubhe@2.0.0

## 2.0.0-alpha.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

### Patch Changes

- Updated dependencies [756ffad]
  - dubhe@2.0.0-alpha.0

## 1.0.5

### Patch Changes

- compiler in dubhe:dts won't do anything but generate dts. it seems that custom tag and devtools api is useless,so remove it

## 1.0.4

### Patch Changes

- 0da2c7e: add debug support

## 1.0.3

### Patch Changes

- add sourcemap support
- Updated dependencies
  - dubhe@1.0.3

## 1.0.2

### Patch Changes

- support generate/consume sourcemap in webpack/esbuild
- ffe20ee: support generate and consume sourcemap ,only work in vite
- Updated dependencies
  - dubhe@1.0.2

## 1.0.1

### Patch Changes

- fd2d4a6: refactor code
- Updated dependencies [fd2d4a6]
- Updated dependencies [39b5295]
  - dubhe@1.0.1
