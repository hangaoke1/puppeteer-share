exports.filterCookie = function(cookie) {
  const whiteList = ['TrackerID', 'pt_key', 'pt_pin', 'pt_token', 'pwdt_id'];
  return cookie.split(';').filter(item => {
    for(let i = 0; i < whiteList.length; i++) {
      if (item.indexOf(whiteList[i]) > -1) {
        return true
      }
    }
    return false
  }).join(';').trim() + ';'
}