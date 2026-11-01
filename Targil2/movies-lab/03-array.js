import { loadData } from "./load.js";
import * as service from "./movies-service.js";
const { movies } = loadData();
//////////////////////////////////////////////////////////////
console.log(service.getTitles(movies));