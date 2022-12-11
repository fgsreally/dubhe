import { Dtag, DubheModel, getModel } from '@dubhe/runtime'

@Dtag('about')
export class AboutModel extends DubheModel {
  change_home_name() {
    getModel('home').changeName()
  }

  emit_update() {
    this.emit('update', {
      from: this._symbol,
      value: 'value from emitter',
      type: 'update',
    })
  }
}
