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
    width : null,
    height : 200,
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
    _setProperty(this, "oElement", document.createElement("table"), true);
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

      this.oHeader.getElement().style.display = "block";
      this.oBody.getElement().style.display = "block";
      this.oFooter.getElement().style.display = "block";

      this.oBody.getElement().style.height = oConfiguracao.height;
      this.oBody.getElement().style["overflow-y"] = "auto";
      this.oBody.getElement().style["overflow-x"] = "hidden";
      this.oBody.getElement().style["padding-right"] = 12;

      this.oElement.appendChild(this.oHeader.getElement());
      this.oElement.appendChild(this.oBody.getElement());
      this.oElement.appendChild(this.oFooter.getElement());

      this.oContainer.appendChild(this.oElement);

      lRenderizada = true;

      return this;
    }

    DataGrid.prototype.setHeight = function(iHeight) {
      oConfiguracao.height = iHeight;
    }
  };

  /**
   * Definição da Grid
   */
  DataGrid.prototype = {

    addHeaderRow : function(aColumns) {
      return this.getTableHeader().newRow(aColumns);
    },

    /**
     * @return {DataGrid.TableRows[]}
     */
    getRows : function() {
      return this.getTableBody().getRows();
    },

    /**
     * Adiciona uma nova coluna na grid
     * @param {object[]|string[]} aColumns - Um array com o conteudo das colunas
     * @return {DataGrid.TableRow}
     */
    addRow : function(aColumns) {
      return this.getTableBody().newRow(aColumns);
    },

    getRowCount : function() {
      return this.getRows().length;
    },

    /**
     * @return {DataGrid.TableHeader}
     */
    getTableHeader : function() {
      return this.oHeader;
    },

    /**
     * @return {DataGrid.TableBody}
     */
    getTableBody : function() {
      return this.oBody;
    },

    /**
     * @return {DataGrid.TableFooter}
     */
    getTableFooter : function() {
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

    var TableRow = function() {

      _setProperty(this, "oElement", document.createElement("tr"), true);

      this.aColumns = [];
    }

    TableRow.prototype = {

      addColumn : function(oColumn) {

        if ( !(oColumn instanceof DataGrid.TableColumn) ) {
          throw "DataGrid.TableRow: Erro ao adicionar a coluna.";
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

    var TableColumn = function(sElement, conteudo) {

      _setProperty(this, "oElement", document.createElement((sElement || "td")), true);

      this.setValue(conteudo);
    }

    TableColumn.prototype = {

      /**
       * Seta o valor da coluna
       * @param {string|object} value
       */
      setValue : function(value) {

        this.oElement.innerHTML = '';

        if (Object.prototype.toString.call(value) == "[object String]") {

          this.oElement.innerHTML = value;
          return TableColumn;
        }

        if (value instanceof HTMLElement) {
          this.oElement.appendChild(value);
          return TableColumn;
        }

        throw "DataGrid.TableColumn: Erro ao atribuir o valor da coluna.";
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
      _setProperty(this, "oElement", document.createElement("thead"), true);

      this.aRows = [];
    }

    TableHeader.prototype = {

      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableHeader.Row) ) {
          throw "DataGrid.TableHeader.addRow: O objeto deve ser uma instancia de DataGrid.TableHeader.Row";
        }

        this.aRows.push(oRow);
        this.oElement.appendChild(oRow.getElement());

        return this;
      },

      newRow : function(aColumns) {

        if (aColumns.length == undefined) {
          throw "DataGrid.TableHeader.newRow: Nenhuma coluna informada.";
        }

        var oRow = new DataGrid.TableHeader.Row();

        if (this.oDataGrid.hasCheckbox) {

          var oColumn = new DataGrid.TableColumn("th", "M");
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn("th", aColumns[iRow]);
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

        return oRow;
      },

      getElement : function() {
        return this.oElement;
      }
    }

    /**
     * DataGrid.TableHead.Row --- Extends DataGrid.TableRow
     */
    ;(function(exports) {

      var Row = function() {
        DataGrid.TableRow.call(this);
      }

      Row.prototype = Object.create(DataGrid.TableRow.prototype);

      exports.Row = Row;
    })(TableHeader);

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
      _setProperty(this, "oElement", document.createElement("tbody"), true);

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

          var oColumn = new DataGrid.TableColumn("td", oCheckbox);
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn("td", aColumns[iRow]);
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
      _setProperty(this, "oElement", document.createElement("tfoot"), true);
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