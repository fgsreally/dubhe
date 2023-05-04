# dubhe 
Provide cli and utility functions for others dubhe project

## cli

```shell

Usage:
  $ dubhe <command> [options]

Commands:
  root                show dubhe CACHE_ROOT/TYPE_ROOT path
  clear               clear dubhe cache & types/cache
  detect              contrast cache version & remote version
  import <projectId>  import source code from <projectId>(like viteout/test)
  delete <project>    delete cache & types-cache from <project>
  install             install cache
  link                link types cache to workspace
  transform           transform esm to systemjs
  export              get remote module exports
  bundle              bundle external dependence for function-level treeshake
  analyse             analyse pub dependence


Options:
  -h, --help     Display this message
  -v, --version  Display version number


```

 