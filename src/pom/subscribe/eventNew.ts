import { fileProvider } from '../../filepack/index.js';
export default () => {
    for(let fpath of fileProvider.listAll("ex_blocks")){
        let f = fileProvider.get(fpath)!;
        // console.warn(fpath,Object.keys(f).join("."));
    }
}