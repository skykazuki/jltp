(function(ctx) {

  function _handleResponse(request, type, response) {
    if (type === 'plain' || type === 'arraybuffer') {
      return response;
    }
    if (type === 'json' && typeof response === 'object') {
      if (!response) {
        return new Error('invalid json resource');
      }
      return response;
    }
    if (!response) {
      return new Error('empty response');
    }
    var _json = null;
    try {
      _json = JSON.parse(response);
    } catch (e) {
      if (request.status === 200) {
        return new Error('error occurred during parsing json response:' + e.message);
      }
      return new Error('(' + request.status + ') ' + request.statusText);
    }
    return _json;
  }

  function _UAJAX(config) {
    var request = new XMLHttpRequest();
    var onSuccess = config.success || function() {};
    var onError = config.error || function() {};
    var onComplete = config.complete || function() {};
    if (config.timeout) {
      request.timeout = config.timeout;
      request.ontimeout = function(e) {
        onError(new Error('timeout'));
        onComplete(new Error('timeout'));
      };
    }

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        var _res = _handleResponse(request, config.type, request.response);
        if (request.status === 200) {
          if (_res instanceof Error) {
            onError(_res);
          } else {
            onSuccess(_res);
          }
          onComplete(_res);
        } else {
          onError(_res);
          onComplete(_res);
        }
      }
    };
    var i;
    if (config.method === 'POST') {
      request.open('POST', config.url);

      if (config.headers) {
        for (i in config.headers) {
          request.setRequestHeader(i, config.headers[i]);
        }
      }
      var _dataStr = '';
      if (config.data) {
        for (i in config.data) {
          if (_dataStr) {
            _dataStr += '&';
          }
          _dataStr += (i + '=' + config.data[i]);
        }
      }
      try {
        if (config.type === 'arraybuffer') {
          request.responseType = 'arraybuffer';
        } else if (config.type === 'json') {
          request.responseType = 'json';
        }
      } catch (e) {}

      if (config.jsonStr) {
        request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        _dataStr = config.jsonStr;
      } else if (config.dataBuffer) {
        _dataStr = config.dataBuffer;
      } else {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
      request.send(_dataStr);
    } else {
      request.open('GET', config.url);
      if (config.headers) {
        for (i in config.headers) {
          request.setRequestHeader(i, config.headers[i]);
        }
      }
      try {
        if (config.type === 'arraybuffer') {
          request.responseType = 'arraybuffer';
        } else if (config.type === 'json') {
          request.responseType = 'json';
        }
      } catch (e) {}
      request.send();
    }
    return request;
  }

  window.UAJAX = _UAJAX;

})(this);

(function() {

  function isMultipleReslut(doc) {

  }

  function handleMultipleReslut() {

  }

  function parseSingleReslut(doc) {
    var rtn = {
      pos: '',
      contents: [],
      meaning: [],
      title: '',
    };

    var posEl = doc.querySelector('.hinshi');
    if (posEl) {
      rtn.pos = posEl.textContent;
    }
    var titleEl = doc.querySelector('.basic_title.nolink h1');
    if (titleEl) {
      titleEl.childNodes.forEach(function(node) {
        if (node.nodeType === 3) {
          rtn.title += node.textContent;
        }
      });
    }
    var contentsEl = doc.querySelector('.contents_area.meaning_area .contents .text');
    if (contentsEl) {
      contentsEl.childNodes.forEach(function(node) {
        if (node.nodeType === 3) {
          rtn.contents.push(node.textContent);
        }
      });
    }
    return rtn;
  }

  function handleRespone(res) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(res, 'text/html');
    if (isMultipleReslut(doc)) {
      handleMultipleReslut(doc);
    } else {
      return parseSingleReslut(doc);
    }
  }

  function queryWord(word) {
    window.UAJAX({
      'url': 'https://dictionary.goo.ne.jp/srch/jn/' + encodeURI(word) + '/m0u/',
      'type': 'plain',
      'success': function(e) {
        console.log('success');
        console.log(e);
      },
      'error': function(e) {
        console.log('error');
      },
    });
  }

})();

