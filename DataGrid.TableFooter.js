  /**
   * TableFooter
   */
  ;(function(exports) {

    'use strict';

    var TableFooter = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "Erro ao criar o header.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("table"), true);
    }

    TableFooter.prototype = {

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableFooter = TableFooter;
  })(DataGrid);
