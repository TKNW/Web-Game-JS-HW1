import "module-alias/register";
import fs from "fs-extra";
import { join } from "path";
import { Commander } from "../src/core/commander";
import { ProcessState } from "../src/utils/error";
import { JSONStorage } from "../src/core/JSONStorage";
import { CollectOperator } from "../src/command/collect";
import { argsParser } from "../src/utils/args-parser";

const savePath = join(__dirname, "test");
const storageFile = join(savePath, "storage.json");
const commander = new Commander();
const readData = () => fs.readJSONSync(storageFile);

beforeAll(() => {
  fs.removeSync(savePath);
  const storage = new JSONStorage(savePath);
  const operator = new CollectOperator(storage);
  commander.load("collect", operator);
});

describe("Arguments Parser", () => {
  const cmds = [
    "without args",
    "-c t1",
    "-c t1 -d 1,1,1 -d 2,2,2 -d 3,3,3",
    "-c t1 -id 1 -name Name",
    "-c t1 -ids 1,2,3,4",
    "-a -b -c",
    "-t 1 -b -c",
    "-c X -name X",
    "-c 1 -c 2 -c 3",
    "-test 1,2,3,4,5,6,7,8,9,10",
  ];

  test("WITHOUT ARGS", () => {
    const params = argsParser(cmds[0].split(" "));
    expect(params).toStrictEqual({});
  });

  test("-c t1", () => {
    const params = argsParser(cmds[1].split(" "));
    expect(params).toStrictEqual({ collect: "t1" });
  });

  test("-c t1 -d 1,1,1 -d 2,2,2 -d 3,3,3", () => {
    const params = argsParser(cmds[2].split(" "));
    expect(params).toStrictEqual({
      collect: "t1",
      books: [
        {
          bookId: "1",
          bookName: "1",
          isbn: "1",
        },
        {
          bookId: "2",
          bookName: "2",
          isbn: "2",
        },
        {
          bookId: "3",
          bookName: "3",
          isbn: "3",
        },
      ],
    });
  });

  test("-c t1 -id 1 -name Name", () => {
    const params = argsParser(cmds[3].split(" "));
    expect(params).toStrictEqual({
      collect: "t1",
      bookId: "1",
      bookName: "Name",
    });
  });

  test("-c t1 -ids 1,2,3,4", () => {
    const params = argsParser(cmds[4].split(" "));
    expect(params).toStrictEqual({
      collect: "t1",
      bookIds: ["1", "2", "3", "4"],
    });
  });

  test("-a -b -c", () => {
    const params = argsParser(cmds[5].split(" "));
    expect(params).toStrictEqual({
      a: undefined,
      b: undefined,
      collect: undefined,
    });
  });

  test("-t 1 -b -c", () => {
    const params = argsParser(cmds[6].split(" "));
    expect(params).toStrictEqual({
      t: "1",
      b: undefined,
      collect: undefined,
    });
  });

  test("-c X -name X", () => {
    const params = argsParser(cmds[7].split(" "));
    expect(params).toStrictEqual({ collect: "X", bookName: "X" });
  });

  test("-c 1 -c 2 -c 3", () => {
    const params = argsParser(cmds[8].split(" "));
    expect(params).toStrictEqual({ collect: "3" });
  });

  test("-test 1,2,3,4,5,6,7,8,9,10", () => {
    const params = argsParser(cmds[9].split(" "));
    expect(params).toStrictEqual({ test: "1,2,3,4,5,6,7,8,9,10" });
  });
});

describe("Arguments Shuffle", () => {
  const expectValue = { i: "10", j: "20", k: "30", l: "40" };
  const allPermutations = [
    "-i 10 -j 20 -k 30 -l 40",
    "-i 10 -j 20 -l 40 -k 30",
    "-i 10 -k 30 -j 20 -l 40",
    "-i 10 -k 30 -l 40 -j 20",
    "-i 10 -l 40 -j 20 -k 30",
    "-i 10 -l 40 -k 30 -j 20",
    "-j 20 -i 10 -k 30 -l 40",
    "-j 20 -i 10 -l 40 -k 30",
    "-j 20 -k 30 -i 10 -l 40",
    "-j 20 -k 30 -l 40 -i 10",
    "-j 20 -l 40 -i 10 -k 30",
    "-j 20 -l 40 -k 30 -i 10",
    "-k 30 -i 10 -j 20 -l 40",
    "-k 30 -i 10 -l 40 -j 20",
    "-k 30 -j 20 -i 10 -l 40",
    "-k 30 -j 20 -l 40 -i 10",
    "-k 30 -l 40 -i 10 -j 20",
    "-k 30 -l 40 -j 20 -i 10",
    "-l 40 -i 10 -j 20 -k 30",
    "-l 40 -i 10 -k 30 -j 20",
    "-l 40 -j 20 -i 10 -k 30",
    "-l 40 -j 20 -k 30 -i 10",
    "-l 40 -k 30 -i 10 -j 20",
    "-l 40 -k 30 -j 20 -i 10",
  ];

  for (const arg of allPermutations) {
    test(arg, () => {
      const result = argsParser(arg.split(" "));
      expect(result).toStrictEqual(expectValue);
    });
  }
});

describe("Make Collect", () => {
  test("Without collect value", () => {
    const result = commander.parse("lb make collect -c");
    expect(result).toStrictEqual({
      state: ProcessState.ERR_ARGS_COLLE,
      command: "make",
      params: { collect: undefined },
    });
  });

  test("Without collect argument", () => {
    const result = commander.parse("lb make collect");
    expect(result).toStrictEqual({
      state: ProcessState.ERR_ARGS_COLLE,
      command: "make",
      params: {},
    });
  });

  for (const colleName of [1, 2, 3, 4, 5]) {
    test(`Make a new collect 'colle${colleName}'`, () => {
      const result = commander.parse(`lb make collect -c colle${colleName}`);
      expect(result).toStrictEqual({
        state: ProcessState.SUCCESS,
        command: "make",
        params: { collect: `colle${colleName}` },
      });
    });
  }

  test("Make a exists collect", () => {
    const result = commander.parse("lb make collect -c colle1");
    expect(result).toStrictEqual({
      state: ProcessState.ERR_COLLE_DUPL,
      command: "make",
      params: { collect: "colle1" },
    });
  });

  test("Check File state", () => {
    const jsonData = fs.readJsonSync(storageFile);
    expect(jsonData).toStrictEqual({
      colle1: { name: "colle1", books: [] },
      colle2: { name: "colle2", books: [] },
      colle3: { name: "colle3", books: [] },
      colle4: { name: "colle4", books: [] },
      colle5: { name: "colle5", books: [] },
    });
  });
});

describe("Drop Collect", () => {
  test("Drop colle1", () => {
    const result = commander.parse("lb drop collect -c colle1");
    expect(result).toStrictEqual({
      state: ProcessState.SUCCESS,
      command: "drop",
      params: { collect: "colle1" },
    });
  });

  test("Check storage1", () => {
    const jsonData = fs.readJsonSync(storageFile);
    expect(jsonData).not.toHaveProperty("colle1");
  });

  test("Drop all", () => {
    const result = commander.parse("lb drop collect");
    expect(result).toStrictEqual({
      state: ProcessState.SUCCESS,
      command: "drop",
      params: {},
    });
  });

  test("Check storage2", () => {
    const jsonData = fs.readJsonSync(storageFile);
    expect(jsonData).toStrictEqual({});
  });

  test("Drop colle1", () => {
    const result = commander.parse("lb drop collect -c colle1");
    expect(result).toStrictEqual({
      state: ProcessState.ERR_COLLE,
      command: "drop",
      params: { collect: "colle1" },
    });
  });

  test("Drop all again", () => {
    const result = commander.parse("lb drop collect");
    expect(result).toStrictEqual({
      state: ProcessState.SUCCESS,
      command: "drop",
      params: {},
    });
  });

  test("Drop without value of arguments", () => {
    const result = commander.parse("lb drop collect -c");
    expect(result).toStrictEqual({
      // state: ProcessState.SUCCESS, 他沒修，這裡我先自己改
      state: ProcessState.ERR_ARGS_COLLE,
      command: "drop",
      params: { collect: undefined },
    });
  });
});

describe("Insert Collect", () => {
  const books = [
    "001,learn-js,9781098139872",
    "002,common-lisp,9780486498201",
    "003,linux-programming,9781593272203",
    "004,data-structure,9780929306407",
    "005,algorithm,9780262033848",
    /**
     * For test isbn
     * - 9789866052675
     * - 9789864762859
     * - 9789865024864
     */
  ];

  for (const book of books) {
    const [bookId, bookName, isbn] = book.split(",");
    test(`Insert book '[${isbn}]${bookName}'`, () => {
      commander.parse(`lb make collect -c t1`);

      const result = commander.parse(`lb insert collect -c t1 -d ${book}`);
      expect(result).toStrictEqual({
        state: ProcessState.SUCCESS,
        command: "insert",
        params: {
          collect: "t1",
          books: [
            {
              bookId,
              bookName,
              isbn,
            },
          ],
        },
      });
    });
  }

  test("Insert Invaild ID", () => {
    const { state } = commander.parse(
      `lb insert collect -c t1 -d 00X,algorithm,9789866052675`
    );
    expect(state).toStrictEqual(ProcessState.ERR_ID);
  });

  test("Insert Invaild ISBN", () => {
    const { state } = commander.parse(
      `lb insert collect -c t1 -d 000,algorithm,9780262033840`
    );
    expect(state).toStrictEqual(ProcessState.ERR_ISBN);
  });

  test("Insert Duplicate ID", () => {
    const { state } = commander.parse(
      `lb insert collect -c t1 -d 001,algorithm,9789866052675`
    );
    expect(state).toStrictEqual(ProcessState.ERR_ID_DUPL);
  });

  test("Insert Duplicate ISBN", () => {
    const { state } = commander.parse(
      `lb insert collect -c t1 -d 009,algorithm,9780262033848`
    );
    expect(state).toStrictEqual(ProcessState.ERR_ISBN_DUPL);
  });

  test("Insert into not exists collect", () => {
    const { state } = commander.parse(
      `lb insert collect -c t0 -d 009,algorithm,9780262033848`
    );
    expect(state).toStrictEqual(ProcessState.ERR_COLLE);
  });

  test("Insert multi book", () => {
    const { state } = commander.parse(
      `lb insert collect -c t1 -d 01,book1,9789866052675 -d 02,book2,9789864762859 -d 03,book3,9789865024864`
    );
    expect(state).toStrictEqual(ProcessState.SUCCESS);
  });

  test("Insert without arugs", () => {
    const { state } = commander.parse(`lb insert collect`);
    expect(state).toStrictEqual(ProcessState.ERR_ARGS_COLLE);
  });

  test("Insert without -d values", () => {
    const { state } = commander.parse(`lb insert collect -c t1 -d -d -d`);
    expect(state).toStrictEqual(ProcessState.ERR_ARGS_BOOK);
  });
});

describe("Update Collect", () => {
  test("Update 1 book", () => {
    commander.parse("lb update collect -c t1 -id 002 -name lisp");
    const json = fs.readJSONSync(storageFile);
    expect(json["t1"].books).toContainEqual({
      bookId: "002",
      bookName: "lisp",
      isbn: "9780486498201",
    });
  });

  test("Update with collect value", () => {
    const { state } = commander.parse(
      "lb update collect -c -id 002 -name lisp"
    );
    expect(state).toEqual(ProcessState.ERR_ARGS_COLLE);
  });

  test("Update with collect value", () => {
    const { state } = commander.parse("lb update collect -c t0 -id -name lisp");
    expect(state).toEqual(ProcessState.ERR_ARGS_ID);
  });

  test("Update with collect value", () => {
    const { state } = commander.parse("lb update collect -c t0 -id abc -name");
    expect(state).toEqual(ProcessState.ERR_ARGS_BOOK);
  });

  test("Update not exist collect", () => {
    const { state } = commander.parse(
      "lb update collect -c t2 -id 002 -name lisp"
    );
    expect(state).toEqual(ProcessState.ERR_COLLE);
  });

  test("Update not exist book", () => {
    const { state } = commander.parse(
      "lb update collect -c t1 -id 010 -name lisp"
    );
    expect(state).toEqual(ProcessState.ERR_ID);
  });
});

describe("Delect Book", () => {

  test("Delete 2 books by id", () => {
    const { state } = commander.parse(`lb delete collect -c t1 -ids 01,02`);
    const json = readData();
    expect(state).toEqual(ProcessState.SUCCESS);
    expect(json.t1.books).not.toContainEqual({
      bookId: "01",
      bookName: "book1",
      isbn: "9789866052675",
    });

    expect(json.t1.books).not.toContainEqual({
      bookId: "02",
      bookName: "book2",
      isbn: "9789864762859",
    });
  });

  test("Delete unmatch any", () => {
    const { state } = commander.parse(`lb delete collect -c t1 -ids 10,20,30`);
    const { books } = readData().t1;
    expect(state).toEqual(ProcessState.SUCCESS);
    expect(books.length).toEqual(6);
  });

  test("Delete 3 books by name", () => {
    const { state } = commander.parse(
      `lb delete collect -c t1 -ids 002 -names learn-js,algorithm`
    );
    const { books } = readData().t1;
    expect(state).toEqual(ProcessState.SUCCESS);
    expect(books.length).toEqual(3);
  });

  test("Delete from not exists Collect", () => {
    const { state } = commander.parse(`lb delete collect -c t0 -ids 10,20,30`);
    expect(state).toEqual(ProcessState.ERR_COLLE);
  });

  test("Delete Witout collect", () => {
    const { state } = commander.parse(
      "lb delete collect -ids 2 -names n1,n2,n3"
    );
    expect(state).toEqual(ProcessState.ERR_ARGS_COLLE);
  });

  test("Real delete from storage", () => {
    const { books } = readData().t1;
    expect(books).toStrictEqual([
      {
        bookId: "003",
        bookName: "linux-programming",
        isbn: "9781593272203",
      },
      {
        bookId: "004",
        bookName: "data-structure",
        isbn: "9780929306407",
      },
      {
        bookId: "03",
        bookName: "book3",
        isbn: "9789865024864",
      },
    ]);
  });
});

describe("Import Data", () => {
  const examplaFile = join(__dirname, "example.json");
  test("Import example.json", () => {
    fs.outputJSONSync(examplaFile, {
      default: {
        name: "default",
        books: [
          { bookId: "001", bookName: "learn-js", isbn: "9781098139872" },
          { bookId: "002", bookName: "common-lisp", isbn: "9780486498201" },
        ],
      },
    });

    const { state } = commander.parse(`lb import collect -f ${examplaFile}`);
    expect(state).toEqual(ProcessState.SUCCESS);
  });

  test("Import not exists file", () => {
    const { state } = commander.parse(
      `lb import collect -f ${join(__dirname, "empty.json")}`
    );
    expect(state).toEqual(ProcessState.ERR_FNAME);
  });

  test("Import without argument", () => {
    const { state } = commander.parse(`lb import collect`);
    expect(state).toEqual(ProcessState.ERR_ARGS_FNAME);
  });

  test("Check import file", () => {
    const json = fs.readJSONSync(storageFile);
    expect(json).toMatchObject({
      default: {
        name: "default",
        books: [
          {
            bookId: "001",
            bookName: "learn-js",
            isbn: "9781098139872",
          },
          {
            bookId: "002",
            bookName: "common-lisp",
            isbn: "9780486498201",
          },
        ],
      },
    });
    expect(Object.keys(json)).toStrictEqual(["t1", "default"]);
  });

  test("Edit after import", () => {
    commander.parse(`lb update collect -c default -id 001 -name js-book`);
    const json = readData().default;
    expect(json.books).toContainEqual({
      bookId: "001",
      bookName: "js-book",
      isbn: "9781098139872",
    });
  });
});
