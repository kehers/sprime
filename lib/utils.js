exports.render = (req, _obj) => {
  const obj = {
    year: (new Date()).getFullYear()
  }
  let msgObj
  while (msgObj = req.session.flash.shift()) {
    obj[msgObj.type] = msgObj.message
  }

  if (_obj == null || typeof _obj !== 'object') return obj
  for (const attr in _obj) {
    if (_obj.hasOwnProperty(attr)) obj[attr] = _obj[attr]
  }

  if (req.user) {
    for (const attr in req.user) {
      obj['acc_' + attr] = req.user[attr]
    }
  }

  return obj
}
