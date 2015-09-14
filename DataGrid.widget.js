(function(global) {

  'use strict';

  var DataGrid = function(oElemento) {
    
    if (typeof(oElemento) != "object") {
      throw "Objeto inválido.";
    }

    Object.defineProperty(this, 'oContainer', { 
      value : oElemento, 
      enumerable : true 
    });

    Object.defineProperty(this, 'oHeader', { value : new DataGrid.TableHeader });
    Object.defineProperty(this, 'oBody', { value : new DataGrid.TableBody });
    Object.defineProperty(this, 'oFooter', { value : new DataGrid.TableFooter });

    var lRenderizada = false;
    // ,
    //     oFragmentBody = document.createDocumentFragment();

    // var oFragment = document.createDocumentFragment();
    
    // oFragment.appendChild(this.oBody.getElement());

    DataGrid.prototype.makeGrid = function() {

      if (!lRenderizada) {
        this.getContainer().appendChild(this.oHeader.getElement());
        this.getContainer().appendChild(this.oBody.getElement());
        this.getContainer().appendChild(this.oFooter.getElement());
      }

      lRenderizada = true;
    }

  };

  /**
   * Definição da Grid
   */
  DataGrid.prototype = {

    /**
     * @return {DataGrid.TableRows[]}
     */
    getRows : function() {
      return this.getBody().getRows();
    },

    /**
     * Adiciona uma nova coluna na grid
     * @param {object[]|string[]} aColumns - Um array com o conteudo das colunas
     * @return {DataGrid.TableRow}
     */
    addRow : function(aColumns) {
      return this.getBody().newRow(aColumns);
    },

    /**
     * @return {DataGrid.TableHeader}
     */
    getHeader : function() {
      return this.oHeader;
    },

    /**
     * @return {DataGrid.TableBody}
     */
    getBody : function() {
      return this.oBody;
    },

    /**
     * @return {DataGrid.TableFooter}
     */
    getFooter : function() {
      return this.oFooter;
    },

    /**
     * @return {Object}
     */
    getContainer : function() {
      return this.oContainer;
    }
  }

  /**
   * DataGrid.TableRow
   */
  ;(function(exports) {

    'use strict';

    var TableRow = function(iRowId) {

      Object.defineProperty(this, "oElement", { 
        value : document.createElement("tr"),
        enumerable : true
      });

      this.aColumns = [];
    }

    TableRow.prototype = {

      addColumn : function(oColumn) {

        if ( !(oColumn instanceof DataGrid.TableColumn) ) {
          throw "Erro ao adicionar a coluna.";
        }

        this.aColumns.push(oColumn);
        this.oElement.appendChild(oColumn.getElement());
      },

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableRow = TableRow;
  })(DataGrid);

  /**
   * DataGrid.TableColumn
   */
  ;(function(exports) {

    'use strict';

    var TableColumn = function(conteudo) {

      Object.defineProperty(this, "oElement", { 
        value : document.createElement("td"),
        enumerable : true
      });

      this.setValue(conteudo);
    }

    TableColumn.prototype = {

      /**
       * Seta o valor da coluna
       * @param {string|object} value
       */
      setValue : function(value) {

        this.oElement.innerHTML = '';

        if (typeof(value) == 'string') {
          this.oElement.innerHTML = value;
          return TableColumn;
        }

        if (typeof(value) == 'object') {
          this.oElement.appendChild(value);
          return TableColumn;
        }

        throw "Erro ao atribuir o valor da coluna.";
      },

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableColumn = TableColumn;
  })(DataGrid);

  /**
   * TableHeader
   */
  ;(function(exports) {

    'use strict';

    var TableHeader = function() {

      Object.defineProperty(this, "oElement", { 
        value : document.createElement("table"),
        enumerable : true
      });
    }

    TableHeader.prototype = {

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableHeader = TableHeader;
  })(DataGrid);

  /**
   * DataGrid.TableBody
   */
  ;(function(exports) {

    'use strict';

    /**
     * DataGrid.TableBody.Row  --- Exteds DataGrid.TableRow 
     */
    ;(function(exports) {

      var Row = function() {
        DataGrid.TableRow.call(this);
      }

      Row.prototype = Object.create(DataGrid.TableRow.prototype);

      Row.prototype.addSelection = function() {

      }

      exports.Row = Row;
    })(TableBody);


    var TableBody = function() {

      Object.defineProperty(this, "oElement", { 
        value : document.createElement("table"),
        enumerable : true
      });

      this.aRows = [];
    }

    TableBody.prototype = {

      addTableRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableRow) ) {
          throw "Erro ao adicionar linha.";
        }

        this.aRows.push(oRow);
        this.oElement.appendChild(oRow.getElement());

        return this;
      },

      /**
       * Cria uma nova linha a partir de um array
       * 
       * @param  {Array}
       * @return {DataGrid.TableRow}
       */
      newRow : function(aColumns) {

        if (aColumns.length == undefined) {
          throw "Erro ao adicionar a linha.";
        }

        var oRow = new DataGrid.TableRow();

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iRow]);
          oRow.addColumn(oColumn);
        }

        this.addTableRow(oRow);

        return oRow;
      },

      /**
       * Limpa o conteúdo
       */
      clearRows : function() {

        this.oElement.innerHTML = '';
        this.aRows = [];

        return this;
      },

      /**
       * @return {Object}
       */
      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableBody = TableBody;
  })(DataGrid);

  /**
   * TableFooter
   */
  ;(function(exports) {

    'use strict';

    var TableFooter = function() {
      
      Object.defineProperty(this, "oElement", { 
        value : document.createElement("table"),
        enumerable : true
      });
    }

    TableFooter.prototype = {

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableFooter = TableFooter;
  })(DataGrid);
  
  global.DataGrid = DataGrid;
})(this);