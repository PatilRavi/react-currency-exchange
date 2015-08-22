
/* jsonp function, (c) Przemek Sobstel 2012, License: MIT, https://github.com/sobstel/jsonp.js */
'use strict';

var $jsonp = (function () {
  var that = {};

  that.send = function (src, options) {
    var options = options || {},
        callback_name = options.callbackName || 'callback',
        on_success = options.onSuccess || function () {},
        on_timeout = options.onTimeout || function () {},
        timeout = options.timeout || 10;

    var timeout_trigger = window.setTimeout(function () {
      window[callback_name] = function () {};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function (data) {
      window.clearTimeout(timeout_trigger);
      on_success(data);
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;

    document.getElementsByTagName('head')[0].appendChild(script);
  };

  return that;
})();

var pairs = [{
  name: "USD/MYR"
}, {
  name: "USD/EUR"
}, {
  name: "USD/BTC"
}];

var curData = [];

function isoDateReviver(value) {
  if (typeof value === 'string') {
    var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec(value);
    if (a) {
      var utcMilliseconds = Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
      return new Date(utcMilliseconds);
    }
  }
  return value;
}

var isoDate = new Date(Date.now()).toISOString();
curData.UTCdate = "Requested on: " + isoDateReviver(isoDate);

var CurrencyEX = React.createClass({
  displayName: 'CurrencyEX',

  getInitialState: function getInitialState() {
    return {
      listVisible: false,
      selectedPair: false,
      curToChange: "",
      curToRev: ""
    };
  },
  select: function select(item) {
    this.props.selected = item;

    this.getInfo();
    this.state.selectedPair = true;
  },
  getInfo: function getInfo() {
    var _this = this;

    var x = this.props.selected.name;
    var uri = "https://currency-api.appspot.com/api/" + x + ".jsonp?callback=handleStuff";
    $jsonp.send(uri, {
      callbackName: 'handleStuff',
      onSuccess: function onSuccess(json) {
        var res = json;
        curData.data = res;
        var temp = 1 / res.rate;
        var reverse = temp.toFixed(7);
        _this.setState({
          rate: res.rate,
          source: res.source,
          target: res.target,
          reverse: reverse
        });
      },
      onTimeout: function onTimeout() {
        console.log('timeout!');
      },
      timeout: 5
    });
  },
  show: function show() {
    this.setState({ listVisible: true });
    document.addEventListener("click", this.hide);
  },
  hide: function hide() {
    this.setState({ listVisible: false });
    document.removeEventListener("click", this.hide);
  },
  handleAdd: function handleAdd() {
    var newCur = prompt("Enter Currency Pair i.e USD/MXN", "");
    pairs.push({ "name": newCur });
  },
  sourceToTarget: function sourceToTarget(evt) {
    this.setState({ curToChange: evt.target.value });
    var conve = this.state.rate;
    var elem = document.getElementById("sourceCur").value;
    var multiply = elem * conve;
    var trim = multiply.toFixed(2);
    //console.log(elem, conve, multiply );
    this.setState({ targetCur: trim });
  },
  targetToSource: function targetToSource(evt) {
    this.setState({ curToRev: evt.target.value });
    var revConve = this.state.rate;
    var revElem = document.getElementById("revSourceCur").value;
    var revMultiply = revElem / revConve;
    var revTrim = revMultiply.toFixed(2);
    //console.log(revConve, revElem, revMultiply );
    this.setState({ revTargetCur: revTrim });
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: "dropdown-container" + (this.state.listVisible ? " show" : "") },
      React.createElement(
        'button',
        {
          id: 'addCur',
          onClick: this.handleAdd },
        'Add New Currency'
      ),
      React.createElement(
        'div',
        {
          className: "dropdown-display" + (this.state.listVisible ? " clicked" : ""),
          onClick: this.show },
        React.createElement(
          'span',
          null,
          this.props.selected.name
        ),
        React.createElement('i', { className: 'fa fa-angle-down' })
      ),
      React.createElement(
        'div',
        { className: 'dropdown-list' },
        React.createElement(
          'div',
          null,
          this.renderListItems()
        )
      ),
      React.createElement(
        'span',
        { className: 'datapeg' },
        React.createElement(
          'div',
          { className: this.state.selectedPair ? "view-display-clicked" : "view-display" },
          curData.UTCdate
        ),
        React.createElement(
          'div',
          { className: this.state.selectedPair ? "view-display-clicked" : "view-display" },
          ' Rate:',
          this.state.rate
        ),
        React.createElement(
          'div',
          { className: this.state.selectedPair ? "view-display-clicked" : "view-display" },
          ' 1',
          this.state.source,
          ' =',
          this.state.rate,
          this.state.target
        ),
        React.createElement(
          'div',
          { className: this.state.selectedPair ? "view-display-clicked" : "view-display" },
          ' 1',
          this.state.target,
          ' =',
          this.state.reverse,
          this.state.source
        )
      ),
      React.createElement(
        'div',
        { className: 'converter' },
        React.createElement(
          'p',
          null,
          'Currency Converter'
        ),
        React.createElement(
          'table',
          null,
          React.createElement(
            'tr',
            null,
            React.createElement(
              'td',
              null,
              React.createElement('input', {
                id: 'sourceCur',
                type: 'text',
                value: this.state.converter,
                onChange: this.sourceToTarget })
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                null,
                this.state.source
              )
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                { id: 'targetCur' },
                this.state.targetCur
              )
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                null,
                this.state.target
              )
            )
          ),
          React.createElement(
            'tr',
            null,
            React.createElement(
              'td',
              null,
              React.createElement('input', {
                id: 'revSourceCur',
                type: 'text',
                value: this.state.curToRev,
                onChange: this.targetToSource })
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                null,
                this.state.target
              )
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                { id: 'revTargetCur' },
                this.state.revTargetCur
              )
            ),
            React.createElement(
              'td',
              null,
              React.createElement(
                'span',
                null,
                this.state.source
              )
            )
          )
        )
      )
    );
  },
  renderListItems: function renderListItems() {
    var items = [];
    for (var i = 0; i < this.props.list.length; i++) {
      var item = this.props.list[i];
      items.push(React.createElement(
        'div',
        { onClick: this.select.bind(null, item) },
        React.createElement(
          'span',
          null,
          item.name
        )
      ));
    }
    return items;
  }
});

React.render(React.createElement(CurrencyEX, {
  list: pairs,
  selected: pairs[0] }), document.getElementById("container"));