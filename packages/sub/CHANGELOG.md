# dubhe-sub

## 2.0.4

### Patch Changes

- 9d51108: support dts hmr in dev mode (now only in vite)
- Updated dependencies [122db68]
- Updated dependencies [9d51108]
  - dubhe@2.0.4

## 2.0.2

### Patch Changes

- 2b5408f: remove repeated .js suffix in html importmap when using hot mode in vite
- Updated dependencies [2b5408f]
  - dubhe@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [e444958]
  - dubhe@2.0.1

## 2.0.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

### Patch Changes

- 26f17d5: it support dev mode for vite pub.it can handle base path correctly
- Updated dependencies [a5b2537]
- Updated dependencies [756ffad]
  - dubhe@2.0.0

## 2.0.0-alpha.2

### Patch Changes

- 26f17d5: it support dev mode for vite pub.it can handle base path correctly

## 2.0.0-alpha.1

### Patch Changes

- Updated dependencies [a5b2537]
  - dubhe@2.0.0-alpha.1

## 2.0.0-alpha.0

### Major Changes

- 756ffad: add support for app&lib(only in vite);add hash support;refactor virtual entry; refactor importmap format

### Patch Changes

- Updated dependencies [756ffad]
  - dubhe@2.0.0-alpha.0

## 1.0.6

### Patch Changes

- 3696a96: webpack plugin can handle externals and importmap correctly in both hot and cold mode
- 59c1395: webpack plugin can handle virtual module correctly

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

- f953595: only resolve dependence to virtual path ('/@id/xx') when a remote app is in dev mode (vite)
- fd2d4a6: refactor code
- 6567afd: fix:virtual module only work when using cache(in webpack)
- Updated dependencies [fd2d4a6]
- Updated dependencies [39b5295]
  - dubhe@1.0.1
