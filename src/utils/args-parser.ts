const argMap = new Map([
  ['c','collect'],
  ['name','bookName'],
  ['id','bookId'],
  ['f','fileName'],
  ['ids','bookIds'],
  ['names','bookNames'],
  ['d','books']
]);
export function argsParser(tokens: string[]) {
  const result: Record<string, any> = {};
  /* Homework */
  const books = [];
  let blankindex = tokens.indexOf('');
  while(blankindex > -1)
  {
    tokens.splice(blankindex, 1);
    blankindex = tokens.indexOf('');
  }
  for(let i = 0; i < tokens.length; ++i)
  {
    if(!tokens[i].startsWith('-'))
    {
      continue;
    }
    const key = ParseFunction(tokens[i]);
    if(i + 1 >= tokens.length)// 邊界檢查
    {
      if(key !== argMap.get('d'))
      {
        result[key] = undefined;
      }
      else
      {
        books.push(undefined);
        result[key] = books;// 這寫法可以再優化
      }
      continue;
    }
    if (!tokens[i+1].startsWith('-'))
    {
      if (key === argMap.get('d'))
      {
        books.push(ParseMultiValue(key, tokens[i+1]));
        result[key] = books;
      }
      else
      {
        result[key] = ParseMultiValue(key, tokens[i+1]);
      }
    }
    else
    {
      result[key] = undefined;
    }
  }
  return result;
}

function ParseFunction(input: string):string
{
  input = input.substring(1);
  const output = argMap.get(input);
  if (output !== undefined)
  {
    return output;
  }
  return input;
}

function ParseMultiValue(functiontype: string, input: string)
{
  if (functiontype === argMap.get('ids') ||functiontype === argMap.get('names')||functiontype === argMap.get('d'))
  {
    const output = input.split(',');
    if(functiontype === argMap.get('d'))
    {
      if(output.length !== 3)
      {
        return undefined;
      }
      const bookoutput: Record<string, any> = {};
      bookoutput.bookId = output[0];
      bookoutput.bookName = output[1];
      bookoutput.isbn = output[2];
      return bookoutput;
    }
    return output;
  }
    return input;
}