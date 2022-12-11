import { D, Dcomputed, Dref, Dtag, DubheModel } from '@dubhe/runtime'
import type { ComputedGetter, Ref } from 'vue'

@Dtag('home')
export class HomeModel extends DubheModel {
  @Dref('home from dubhe')
  name: Ref<string>

  @Dcomputed<HomeModel, string>(({ name }) => {
    return `${name.value}--from dubhe`
  })
  fullName: ComputedGetter<string>

  changeName() {
    this.name.value = 'fgs'
  }

  @D
  on_update() {
    this.on('update', (e) => {
      this.name.value = `${e.value} from ${e.from}`
    })
  }
}

