import { HomeModel } from './home';
import '@dubhe/runtime'

declare module '@dubhe/runtime'{
    interface DubheNameSpace {
        home: HomeModel;
      }
     
      interface DubheEvents{
        update:{
          type:string,
          value:string,
          from:string
        }
      }
}

