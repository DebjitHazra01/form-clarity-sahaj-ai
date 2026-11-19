declare module 'wav' {
  import { Transform } from 'stream';
  export class Writer extends Transform {
    constructor(options?: any);
  }
  const wav: any;
  export default wav;
}
