exports.render = (req, _obj) => {
    const obj = {
      year: (new Date()).getFullYear()
    };
    let msgObj;
    while (msgObj = req.session.flash.shift()) {
      obj[msgObj.type] = msgObj.message;
    }

    if (null == _obj || "object" != typeof _obj) return obj;
    for (let attr in _obj) {
      if (_obj.hasOwnProperty(attr)) obj[attr] = _obj[attr];
    }

    if (req.user) {
      for (let attr in req.user) {
        obj['acc_'+attr] = req.user[attr];
      }
    }

    return obj;
}
