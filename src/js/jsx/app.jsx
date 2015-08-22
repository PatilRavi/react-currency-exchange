
/* jsonp function, (c) Przemek Sobstel 2012, License: MIT, https://github.com/sobstel/jsonp.js */
var $jsonp = (function(){
  var that = {};

  that.send = function(src, options) {
    var options = options || {},
      callback_name = options.callbackName || 'callback',
      on_success = options.onSuccess || function(){},
      on_timeout = options.onTimeout || function(){},
      timeout = options.timeout || 10;

    var timeout_trigger = window.setTimeout(function(){
      window[callback_name] = function(){};
      on_timeout();
    }, timeout * 1000);

    window[callback_name] = function(data){
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


var pairs = [
  {
    name: "USD/MYR"
  },
  {
    name: "USD/EUR"
  },
  {
    name: "USD/BTC"
  }
];

var curData = [ ];

function isoDateReviver( value ) {
  if ( typeof value === 'string' ) {
    var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(?:([\+-])(\d{2})\:(\d{2}))?Z?$/.exec( value );
    if ( a ) {
      var utcMilliseconds = Date.UTC( +a[ 1 ], +a[ 2 ] - 1, +a[ 3 ], +a[ 4 ], +a[ 5 ], +a[ 6 ] );
      return new Date( utcMilliseconds );
    }
  }
  return value;
}

var isoDate = new Date( Date.now() ).toISOString();
curData.UTCdate = "Requested on: " + isoDateReviver( isoDate );

var CurrencyEX = React.createClass( {
  getInitialState: function () {
    return {
      listVisible: false,
      selectedPair: false,
      curToChange: "",
      curToRev: ""
    };
  },
  select: function ( item ) {
    this.props.selected = item;

    this.getInfo();
    this.state.selectedPair = true;
  },
  getInfo: function () {
    var x = this.props.selected.name;
    var uri = "https://currency-api.appspot.com/api/" + x + ".jsonp?callback=handleStuff";
    $jsonp.send( uri, {
      callbackName: 'handleStuff',
      onSuccess: json => {
        var res = json;
        curData.data = res;
        var temp = 1 / res.rate;
        var reverse = temp.toFixed( 7 );
        this.setState( {
          rate: res.rate,
          source: res.source,
          target: res.target,
          reverse: reverse
        } );
      },
      onTimeout: function(){
        console.log('timeout!');
      },
      timeout: 5
    });
  },
  show: function () {
    this.setState( { listVisible: true } );
    document.addEventListener( "click", this.hide );
  },
  hide: function () {
    this.setState( { listVisible: false } );
    document.removeEventListener( "click", this.hide );
  },
  handleAdd: function () {
    var newCur = prompt( "Enter Currency Pair i.e USD/MXN", "" );
    pairs.push( { "name": newCur } );
  },
  sourceToTarget: function ( evt ) {
    this.setState( { curToChange: evt.target.value } );
    var conve = this.state.rate;
    var elem = document.getElementById( "sourceCur" ).value;
    var multiply = elem * conve;
    var trim = multiply.toFixed( 2 );
    //console.log(elem, conve, multiply );
    this.setState( { targetCur: trim } );
  },
  targetToSource: function ( evt ) {
    this.setState( { curToRev: evt.target.value } );
    var revConve = this.state.rate;
    var revElem = document.getElementById( "revSourceCur" ).value;
    var revMultiply = revElem / revConve;
    var revTrim = revMultiply.toFixed( 2 );
    //console.log(revConve, revElem, revMultiply );
    this.setState( { revTargetCur: revTrim } );
  },
  render: function () {
    return < div className={ "dropdown-container" + (this.state.listVisible ? " show" : "") }>
             < button
                      id="addCur"
                      onClick={ this.handleAdd }>
               Add New Currency
               < /button>
                 < div
                       className={ "dropdown-display" + (this.state.listVisible ? " clicked" : "") }
                       onClick={ this.show }>
                   < span>
                     { this.props.selected.name }
                     < /span>
                       < i className="fa fa-angle-down">
                         < /i>
                           < /div>
                             < div className="dropdown-list">
                               < div>
                                 { this.renderListItems() }
                                 < /div>
                                   < /div>
                                     < span className="datapeg">
                                       < div className={ (this.state.selectedPair ? "view-display-clicked" : "view-display") }>
                                         { curData.UTCdate }
                                         < /div>
                                           < div className={ (this.state.selectedPair ? "view-display-clicked" : "view-display") }> Rate:
                                             { this.state.rate }
                                             < /div>
                                               < div className={ (this.state.selectedPair ? "view-display-clicked" : "view-display") }> 1
                                                 { this.state.source } =
                                                 { this.state.rate }
                                                 { this.state.target }
                                                 < /div>
                                                   < div className={ (this.state.selectedPair ? "view-display-clicked" : "view-display") }> 1
                                                     { this.state.target } =
                                                     { this.state.reverse }
                                                     { this.state.source }
                                                     < /div>
                                                       < /span>
                                                         < div className="converter">
                                                           < p>
                                                             Currency Converter
                                                             < /p>
                                                               < table>
                                                                 < tr>
                                                                   < td>
                                                                     < input
                                                                             id="sourceCur"
                                                                             type="text"
                                                                             value={ this.state.converter }
                                                                             onChange={ this.sourceToTarget } />
                                                                     </td>
                                                                     < td>
                                                                       < span>
                                                                         { this.state.source }
                                                                         < /span>
                                                                           </td>
                                                                           < td>
                                                                             < span id="targetCur">
                                                                               { this.state.targetCur }
                                                                               < /span>
                                                                                 </td>
                                                                                 < td>
                                                                                   < span>
                                                                                     { this.state.target }
                                                                                     < /span>
                                                                                       </td>
                                                                                       < /tr>
                                                                                         < tr>
                                                                                           < td>
                                                                                             < input
                                                                                                     id="revSourceCur"
                                                                                                     type="text"
                                                                                                     value={ this.state.curToRev }
                                                                                                     onChange={ this.targetToSource } />
                                                                                             </td>
                                                                                             < td>
                                                                                               < span>
                                                                                                 { this.state.target }
                                                                                                 < /span>
                                                                                                   </td>
                                                                                                   < td>
                                                                                                     < span id="revTargetCur">
                                                                                                       { this.state.revTargetCur }
                                                                                                       < /span>
                                                                                                         </td>
                                                                                                         < td>
                                                                                                           < span>
                                                                                                             { this.state.source }
                                                                                                             < /span>
                                                                                                               </td>
                                                                                                               < /tr>
                                                                                                                 < /table>
                                                                                                                   < /div>
                                                                                                                     < /div>;
  },
  renderListItems: function () {
    var items = [ ];
    for (var i = 0; i < this.props.list.length; i++) {
      var item = this.props.list[ i ];
      items.push( < div onClick={ this.select.bind(null, item) }>
                    < span>
                      { item.name }
                      < /span>
                        < /div> );
    }
    return items;
  }
} );

React.render( < CurrencyEX
                           list={ pairs }
                           selected={ pairs[0] } />, document.getElementById( "container" ) );
