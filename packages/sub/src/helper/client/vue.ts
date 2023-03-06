import type { App } from '@vue/devtools-api'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
const FEDERATION_KEY = 'dubhe'
export function vueDev(isForce = false) {
  return {
    install(app: App) {
      if (process.env.NODE_ENV === 'development' || isForce) {
        let devtoolsApi: any

        setupDevtoolsPlugin(
          {
            id: FEDERATION_KEY,
            label: FEDERATION_KEY,
            packageName: FEDERATION_KEY,
            enableEarlyProxy: true,
            componentStateTypes: [FEDERATION_KEY],
            app,
          },
          (api) => {
            devtoolsApi = api
            api.on.inspectComponent(({ componentInstance, instanceData }) => {
              const { projectID, fileID } = componentInstance.type
              if (projectID && fileID) {
                instanceData.state.push({
                  type: FEDERATION_KEY,
                  editable: false,
                  key: 'projectID (远程项目ID)',
                  value: projectID,
                })
                instanceData.state.push({
                  type: FEDERATION_KEY,
                  editable: false,
                  key: 'fileID (对应文件ID)',
                  value: fileID,
                })
                instanceData.state.push({
                  type: FEDERATION_KEY,
                  editable: false,
                  key: 'import (这样引入)',
                  value: `import X from "!${projectID}/${fileID}"`,
                })
              }
            })

            api.on.visitComponentTree(
              ({ treeNode, componentInstance }) => {
                const { projectID, fileID } = componentInstance.type
                if (projectID && fileID) {
                  treeNode.tags.push({
                    label: 'Publish',
                    textColor: 0x16A085,
                    backgroundColor: 0x8EC5FC,
                    tooltip: `remote component from ${projectID}"`,
                  })
                }
              },
            )

            api.addTimelineLayer({
              id: FEDERATION_KEY,
              color: 0x8EC5FC,
              label: FEDERATION_KEY,
            })
          },
        )

        app.mixin({
          mounted() {
            const { projectID, fileID } = this.$options || {}
            if (projectID && fileID && devtoolsApi) {
              devtoolsApi.addTimelineEvent({
                layerId: 'dubhe',
                event: {
                  time: devtoolsApi.now(),
                  data: {
                    projectID, fileID, message: '组件挂载', time: devtoolsApi.now(), importID: `!${projectID}/${fileID}`,
                  },
                  title: `!${projectID}/${fileID}`,
                },
              })
            }
          },
        })
      }
    },
  }
}

