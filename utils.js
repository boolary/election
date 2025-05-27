export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getParams = (method, headers, params) => {
  return {
    method,
    headers,
    body: new URLSearchParams({
      ...params
    })
  };
}

export const reformatOption = ($) => {
  return $('option').map((_, option) => ({
    id: parseInt($(option).attr('data-id'), 10),
    value: parseInt($(option).attr('value'), 10),
    name: $(option).text().trim()
  })).get();
}


export const regex = /<div class=['"]table-file active['"]>.*?<a href=['"]([^'"]+\.pdf)['"]/si;