const mem_store = {
  is_visitor: false,
  ws: null,

}

export const set_mem_store = (k: keyof typeof mem_store, value: any) => {
  mem_store[k] = value
  return value
}

export const get_mem_store = (k: keyof typeof mem_store) => mem_store[k]