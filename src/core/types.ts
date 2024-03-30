import { ProcessState } from "../utils/error";

/**
 * @berif 回傳確認的指令
 * @example
 * 若輸入 `lb <command> collect -arg1 a -arg2 b -arg3 c`，且假設運作正常
 * ParseResult {
 *  command: "create",
 *  state: ProcessState.SUCCESS
 *  params: {
 *    arg1: 'a',
 *    arg2: 'b',
 *    arg3: 'c',
 * }
 */
export interface ParseResult {
  command: string;
  state: ProcessState;
  params: { [key: string]: string };
}

export interface IStorage<T = any> {
  /**
   * @berif 回傳目前 Storage 儲存的物件數量
   * @returns 目前儲存的物件數量
   */
  size(): number;

  /**
   * @berif 使用 key 從 Storage 取得物件
   */
  getItem(key: string): T | undefined;

  /**
   * @berif 使用 key 儲存一個 T
   * @example
   * this.setItem("collect1", { name: "collect1" })
   *
   * @returns 回傳 `value` 的深拷貝
   */
  setItem(key: string, value: T): T;

  /**
   * @berif 根據 `key` 刪除一筆儲存的資料
   * @returns 若欲刪除的 `key` 存在，回傳 true ; 反之 false
   */
  removeItem(key: string): boolean;

  /**
   * @berif 清除`Storage`所有的資料
   * @returns 若 Storage 有資料可清除，回傳 true ; 反之 false
   */
  clear(): boolean;
}

/**
 * @berif 針對資源進行操作的 Interface
 * `...args:any []` 是一種特殊的參數，意思是把參數的簽章留給時作者決定
 */
export interface IResourceOperator<T = any> {
  resources: IStorage<T>;

  /**
   * @berif 檢查輸入的 COMMAND 是否合法
   * 建議用來檢查參數缺失(`ERR_ARGS`)系列的錯誤，規則類的錯誤留給底下的方法實做
   *
   * Hint: 若檢查後沒問題，可以直接分發給其他方法
   */
  isValidateCmd(...args: any[]): ProcessState;

  /**
   * @berif 若參數無誤，則根據參數刪除對應的資源
   * @returns 回傳刪除的資源數量
   */
  drop(...args: any[]): number;

  /**
   * @berif 若參數無誤，則根據參數初始化對應的資源
   * @returns 若成功初始化，回傳 true
   */
  make(...args: any[]): boolean;

  /**
   * @berif 若參數無誤，則根據參數新增對應的資源(部份情境下同 `make`)
   * @returns 若成功新增，回傳新增的資料數量
   */
  insert(...args: any[]): number;

  /**
   * @berif 若參數無誤，則根據參數更新對應的資源
   * @returns 若資料有異動，回傳 true
   */
  update(...args: any[]): boolean;

  /**
   * @berif 若參數無誤，則根據參數刪除對應的資源(部份情境下同`drop`)
   * @returns 回傳刪除的資源數量
   */
  delete(...args: any[]): number;

  /**
   * @berif 若參數無誤，載入特定的資原
   */
  import(filename: string): void;
}

export interface ICommander {
  /**
   * @berif 可以不實做，但是建議實做可以預先 load() 一些組件
   * @example
   *
   * public initialDefaultCmd() {
   *  this.load('collect', Collect);
   * }
   *
   */
  initialDefaultCmd(...args: any[]): void;

  /**
   * @berif 解析指定的 Command
   */
  parse(cmd: string): ParseResult;

  /**
   * @berif 載入特定的 Operator，並擴充 lb [command] <label> 等語法
   */
  load(label: string, runner: IResourceOperator): any;
}
