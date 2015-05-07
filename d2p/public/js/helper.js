function _get_unique_id(char) {
  return Math.random().toString(36).toString(36).substr(char * 1, 16);
}

$.fn.chater = function () {
  var _t = this;
  var _id = _get_unique_id(6);
  _t.wrap = $("<div>").attr({
    id: _id,
    class: 'chater'
  });
  _t.hd = $("<div>").addClass('chatheader').text("online available persons");
  _t.msg = $("<div>").addClass('chatmsg');
  _t.chtxt = $("<div>").addClass('chattext');
  _t.wrap.append(_t.hd, _t.msg, _t.chtxt);
  _t.append(_t.wrap);
  var socket = io.connect('/socket');
};