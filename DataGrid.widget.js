(function(global) {

  'use strict';

  function _setProperty(oObj, sProperty, value, lEnumerable, lWritable, lConfigurable) {

    Object.defineProperty(oObj, sProperty, {
      value : value,
      enumerable : lEnumerable || false,
      writable : lWritable || false,
      configurable : lConfigurable || false
    });
  }

  var _oConfig = {
    checkbox : false
  };

  var DataGrid = function(oElemento, oConfig) {

    if ( !(oElemento instanceof Object) ) {
      throw "DataGrid: Elemento inválido.";
    }

    var oConfiguracao = {},
        lRenderizada = false;

    for (var sConf in _oConfig) {

      oConfiguracao[sConf] = _oConfig[sConf];

      if (oConfig instanceof Object && oConfig.hasOwnProperty(sConf)) {
        oConfiguracao[sConf] = oConfig[sConf];
      }
    }

    _setProperty(this, "oContainer", oElemento, true);
    _setProperty(this, "oHeader", new DataGrid.TableHeader(this));
    _setProperty(this, "oBody", new DataGrid.TableBody(this));
    _setProperty(this, "oFooter", new DataGrid.TableFooter(this));

    Object.defineProperty(this, 'hasCheckbox', {
      get : function() { return oConfiguracao.checkbox; },
      enumerable : true
    });

    /**
     * Renderiza a Grid
     *
     * @throws
     * @return {DataGrid}
     */
    DataGrid.prototype.makeGrid = function() {

      if (lRenderizada) {
        throw "DataGrid: Grid já renderizada.";
      }

      this.getContainer().appendChild(this.oHeader.getElement());
      this.getContainer().appendChild(this.oBody.getElement());
      this.getContainer().appendChild(this.oFooter.getElement());

      lRenderizada = true;

      return this;
    }
  };

  /**
   * Definição da Grid
   */
  DataGrid.prototype = {

    addHeaderRow : function(aColumns) {
      return this.getHeader().newRow(aColumns);
    },

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

    getRowCount : function() {
      return this.getRows().length;
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

      _setProperty(this, "oElement", document.createElement("tr"), true);

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

      /**
       * Retorna a Coluna pelo indice
       *
       * @param  {integer} iIndex
       * @throw
       * @return {DataGrid.TableColumn}
       */
      getColumnByIndex : function(iIndex) {

        if (this.aColumns[iIndex] == undefined) {
          throw "DataGrid.TableRow: Indice indefinido.";
        }

        return this.aColumns[iindex];
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

      _setProperty(this, "oElement", document.createElement("td"), true);

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

    var TableHeader = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGrid.TableHeader: Erro ao criar o header.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("table"), true);

      this.aRows = [];
    }

    TableHeader.prototype = {

      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableRow) ) {
          throw "DataGrid.TableHeader.addRow: O objeto deve ser uma instancia de DataGrid.TableRow";
        }

        this.aRows.push(oRow);
        this.oElement.appendChild(oRow.getElement());

        return this;
      },

      newRow : function(aColumns) {

        if (aColumns.length == undefined) {
          throw "DataGrid.TableHeader.newRow: Nenhuma coluna informada.";
        }

        var oRow = new DataGrid.TableRow();

        if (this.oDataGrid.hasCheckbox) {

          var oColumn = new DataGrid.TableColumn("M");
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iRow]);
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

        return oRow;
      },

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

    var TableBody = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGrid.TableBody: Erro ao criar o body.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("table"), true);

      this.aRows = [];
    }

    TableBody.prototype = {

      /**
       * Adiciona uma nova linha
       *
       * @param {DataGrid.TableBody.Row} oRow
       * @throws
       * @return {DataGrid.TableBody}
       */
      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableBody.Row) ) {
          throw "DataGrid.TableBody.addRow: O objeto deve ser uma instancia de DataGrid.TableBody.Row";
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

        var oRow = new DataGrid.TableBody.Row();

        if (this.oDataGrid.hasCheckbox) {

          var oCheckbox = document.createElement("input");
          oCheckbox.type = "checkbox";

          var oColumn = new DataGrid.TableColumn(oCheckbox);
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iRow]);
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

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

      getRows : function() {
        return this.aRows;
      },

      /**
       * @return {Object}
       */
      getElement : function() {
        return this.oElement;
      }
    }

    /**
     * DataGrid.TableBody.Row  --- Extends DataGrid.TableRow
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

    exports.TableBody = TableBody;
  })(DataGrid);

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

  global.DataGrid = DataGrid;
})(this);