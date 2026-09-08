export { evaluate } from "../evaluate.ts";

import { setupMcp } from "../setup.ts";
export const setup = (base: string) => setupMcp(base, "stdio");
