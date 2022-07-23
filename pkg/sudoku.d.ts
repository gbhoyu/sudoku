/* tslint:disable */
/* eslint-disable */
/**
*/
export class Board {
  free(): void;
/**
* @returns {Board}
*/
  static blank(): Board;
/**
* @returns {Board}
*/
  static hard(): Board;
/**
* @returns {Board}
*/
  static easy(): Board;
/**
* @param {number} x
* @param {number} y
* @returns {boolean}
*/
  solve_rng(x: number, y: number): boolean;
/**
* @returns {number}
*/
  get_dificulty(): number;
/**
* @param {number} x
* @param {number} y
* @returns {string}
*/
  get_value(x: number, y: number): string;
/**
* @param {number} x
* @param {number} y
* @returns {string}
*/
  get_value_solution(x: number, y: number): string;
/**
*/
  print(): void;
/**
*/
  print_solution(): void;
/**
* @param {number} x
* @param {number} y
* @param {number} val
* @param {string} tile_type
*/
  set_state(x: number, y: number, val: number, tile_type: string): void;
/**
* @param {number} x
* @param {number} y
* @returns {string}
*/
  get_state(x: number, y: number): string;
/**
* @param {number} x
* @param {number} y
* @param {number} number
* @param {boolean} val
*/
  set_anotation(x: number, y: number, number: number, val: boolean): void;
/**
* @param {number} x
* @param {number} y
* @param {number} number
* @returns {boolean}
*/
  get_anotation(x: number, y: number, number: number): boolean;
/**
* @returns {boolean}
*/
  is_finished(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_board_free: (a: number) => void;
  readonly board_blank: () => number;
  readonly board_hard: () => number;
  readonly board_easy: () => number;
  readonly board_solve_rng: (a: number, b: number, c: number) => number;
  readonly board_get_dificulty: (a: number) => number;
  readonly board_get_value: (a: number, b: number, c: number, d: number) => void;
  readonly board_get_value_solution: (a: number, b: number, c: number, d: number) => void;
  readonly board_print: (a: number) => void;
  readonly board_print_solution: (a: number) => void;
  readonly board_set_state: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly board_get_state: (a: number, b: number, c: number, d: number) => void;
  readonly board_set_anotation: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly board_get_anotation: (a: number, b: number, c: number, d: number) => number;
  readonly board_is_finished: (a: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
}

/**
* Synchronously compiles the given `bytes` and instantiates the WebAssembly module.
*
* @param {BufferSource} bytes
*
* @returns {InitOutput}
*/
export function initSync(bytes: BufferSource): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
