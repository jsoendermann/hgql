import compress from 'graphql-query-compress'

export const gql = (strs: TemplateStringsArray, ...values: any[]) => {
  let ret = ''
  for (let i = 0; i < strs.length; i++) {
    ret += strs[i]
    if (i < values.length) {
      ret += values[i]
    }
  }
  return compress(ret).trim()
}
